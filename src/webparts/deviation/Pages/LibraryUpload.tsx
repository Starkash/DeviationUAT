import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import JSZip from "jszip";
import { saveAs } from "file-saver";

import {
    Table, Upload, Button, Popconfirm, message, Divider

} from "antd";

import {
    FileOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined,
    FilePptOutlined, FileImageOutlined, FileZipOutlined, FileTextOutlined,
    FileMarkdownOutlined, CodeOutlined, FolderOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, UploadOutlined
} from "@ant-design/icons";
import { IDeviationProps } from "../components/IDeviationProps";
import "./NewRequest.css";
import { FieldUrlRenderer } from "@pnp/spfx-controls-react";

interface FolderItem {
    Name: string;
    ServerRelativeUrl: string;
    Type: "Folder" | "File";
    FileUrl?: string;
    FileSize?: number;
    LastModified?: string;
    ModifiedBy?: string;
}

export const LibraryUpload: React.FunctionComponent<IDeviationProps> = (props: IDeviationProps) => {

    const history = useHistory();
    const [folderSizes, setFolderSizes] = useState<{ [key: string]: number }>({});

    const [libraries, setLibraries] = useState<FolderItem[]>([]);
    const [currentItems, setCurrentItems] = useState<FolderItem[]>([]);
    const [breadcrumb, setBreadcrumb] = useState<FolderItem[]>([]);
    const webAbsoluteUrl: string = props.currentSPContext.pageContext.web.absoluteUrl;
    const [recentFiles, setRecentFiles] = useState<FolderItem[]>([]);
    const [allItems, setAllItems] = useState<FolderItem[]>([]);

    useEffect(() => {
        var libraryName = 'test1';

        fetchLibraries1(libraryName)
        fetchAllRecentFiles(libraryName);
    }, []);

    const searchItems = (query: string) => {
        if (!query) {
            setCurrentItems(allItems);
            return;
        }

        const filteredItems = allItems.filter(item =>
            item.Name.toLowerCase().includes(query.toLowerCase())
        );

        setCurrentItems(filteredItems);
    };

    const downloadFolderAsZip = async (folder: FolderItem) => {
        const zip = new JSZip();
        const folderZip = zip.folder(folder.Name)!;

        const addFilesToZip = async (folderUrl: string, parentZip: JSZip) => {
            try {
                const response = await fetch(
                    `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')?$expand=Files,Folders`,
                    { headers: { Accept: "application/json;odata=verbose" } }
                );
                if (!response.ok) throw new Error("Failed to fetch folder contents.");
                const data = await response.json();

                for (const file of data.d.Files.results) {
                    const fileResponse = await fetch(`${webAbsoluteUrl}${file.ServerRelativeUrl}`);
                    const blob = await fileResponse.blob();
                    parentZip.file(file.Name, blob);
                }

                for (const subfolder of data.d.Folders.results) {
                    const subfolderZip = parentZip.folder(subfolder.Name)!;
                    await addFilesToZip(subfolder.ServerRelativeUrl, subfolderZip);
                }
            } catch (error) {
                console.error("Error adding files to ZIP:", error);
            }
        };

        await addFilesToZip(folder.ServerRelativeUrl, folderZip);
        zip.generateAsync({ type: "blob" }).then((blob) => saveAs(blob, `${folder.Name}.zip`));
    };

    const calculateFolderSize = async (folderUrl: string): Promise<number> => {
        if (folderSizes[folderUrl]) return folderSizes[folderUrl];

        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')?$expand=Files,Folders/Files`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );
            if (!response.ok) throw new Error("Failed to fetch folder contents.");
            const data = await response.json();

            let totalSize = 0;

            data.d.Files.results.forEach((file: any) => {
                totalSize += parseInt(file.Length, 10);
            });

            for (const subfolder of data.d.Folders.results) {
                totalSize += await calculateFolderSize(subfolder.ServerRelativeUrl);
            }

            setFolderSizes(prevSizes => ({ ...prevSizes, [folderUrl]: totalSize }));

            return totalSize;
        } catch (error) {
            console.error("Error calculating folder size:", error);
            return 0;
        }
    };

    const calculateFolderSize1 = async (folderUrl: string): Promise<number> => {
        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')?$expand=Files,Folders/Files`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );
            if (!response.ok) throw new Error("Failed to fetch folder contents.");
            const data = await response.json();

            let totalSize = 0;
            data.d.Files.results.forEach((file: any) => totalSize += parseInt(file.Length, 10));
            for (const subfolder of data.d.Folders.results) {
                totalSize += await calculateFolderSize(subfolder.ServerRelativeUrl);
            }

            return totalSize;
        } catch (error) {
            console.error("Error calculating folder size:", error);
            return 0;
        }
    };

    const fetchLibraries1 = async (libraryName: any) => {
        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/lists?$filter=BaseTemplate eq 101 and Title eq '${libraryName}'&$expand=RootFolder,LastModifiedByUser`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );
            const data = await response.json();

            if (data.d && data.d.results.length > 0) {
                const bankingLibrary = data.d.results[0];

                const library: FolderItem = {
                    Name: bankingLibrary.Title,
                    ServerRelativeUrl: bankingLibrary.RootFolder.ServerRelativeUrl,
                    Type: "Folder",
                    LastModified: new Date(bankingLibrary.LastItemModifiedDate).toLocaleString(),
                    ModifiedBy: bankingLibrary.LastModifiedByUser?.Title || "",
                };

                setLibraries([library]);
                setBreadcrumb([]);
                fetchItems(library);
            } else {
                message.error("Banking library not found.");
            }
        } catch (error) {
            console.error("Error fetching Banking library:", error);
        }
    };

    const fetchLibraries = async () => {
        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/lists?$filter=BaseTemplate eq 101&$expand=RootFolder`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );
            const data = await response.json();
            if (data.d && data.d.results) {

               
                const libraryList: FolderItem[] = data.d.results.map((lib: any) => ({
                    Name: lib.Title,
                    ServerRelativeUrl: lib.RootFolder.ServerRelativeUrl,
                    Type: "Folder",
                    LastModified: new Date(lib.LastItemModifiedDate).toLocaleString(),
                    ModifiedBy: lib.LastModifiedBy?.Title || "",
                }));
                setLibraries(libraryList);
                setBreadcrumb([]);
            }
        } catch (error) {
            console.error("Error fetching libraries:", error);
        }
    };

    const fetchItems = async (parent: FolderItem) => {
        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${parent.ServerRelativeUrl}')?$expand=Folders,Files,Files/ModifiedBy`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );

            const data = await response.json();
            if (data.d) {
                const folderList: FolderItem[] = await Promise.all(
                    data.d.Folders.results.map(async (folder: any) => {

                        const modifiedBy = await fetchModifiedBy(folder.ServerRelativeUrl);

                        return {
                            Name: folder.Name,
                            ServerRelativeUrl: folder.ServerRelativeUrl,
                            Type: "Folder",
                            LastModified: new Date(folder.TimeLastModified).toLocaleString(),
                            ModifiedBy: modifiedBy,
                        };
                    })
                );

                const fileList: FolderItem[] = data.d.Files.results.map((file: any) => ({
                    Name: file.Name,
                    ServerRelativeUrl: file.ServerRelativeUrl,
                    FileUrl: webAbsoluteUrl + file.ServerRelativeUrl,
                    Type: "File",
                    FileSize: parseInt(file.Length, 10),
                    LastModified: new Date(file.TimeLastModified).toLocaleString(),
                    ModifiedBy: file.ModifiedBy?.Title || "",
                }));

                setCurrentItems([...folderList, ...fileList]);

                setBreadcrumb((prev) => {
                    if (prev.length > 0 && prev[prev.length - 1].ServerRelativeUrl === parent.ServerRelativeUrl) {
                        return prev;
                    }
                    return [...prev, parent];
                });

                for (const folder of folderList) {
                    calculateFolderSize(folder.ServerRelativeUrl);
                }
            }
        } catch (error) {
            console.error("Error fetching folders & files:", error);
        }
    };

    const fetchModifiedBy = async (folderUrl: string) => {
        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')/ListItemAllFields?$select=EditorId`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );

            const data = await response.json();
            const editorId = data.d?.EditorId;

            if (editorId) {
                return await fetchUserById(editorId);
            }
            return "";
        } catch (error) {
            console.error("Error fetching folder modified by:", error);
            return "";
        }
    };
    const fetchUserById = async (userId: number) => {
        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/getuserbyid(${userId})?$select=Title`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );

            const data = await response.json();
            return data.d?.Title || "";
        } catch (error) {
            console.error("Error fetching user details:", error);
            return "";
        }
    };

    const fetchItems9 = async (parent: FolderItem) => {
        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${parent.ServerRelativeUrl}')?$expand=Folders,Files,Files/ModifiedBy`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );
            const data = await response.json();

            if (data.d) {
                const folderList: FolderItem[] = data.d.Folders.results.map((folder: any) => ({
                    Name: folder.Name,
                    ServerRelativeUrl: folder.ServerRelativeUrl,
                    Type: "Folder",
                    LastModified: new Date(folder.TimeLastModified).toLocaleString(),
                    ModifiedBy: folder.ModifiedBy?.Title || "",
                }));

                const fileList: FolderItem[] = data.d.Files.results.map((file: any) => ({
                    Name: file.Name,
                    ServerRelativeUrl: file.ServerRelativeUrl,
                    FileUrl: webAbsoluteUrl + file.ServerRelativeUrl,
                    Type: "File",
                    FileSize: parseInt(file.Length, 10),
                    LastModified: new Date(file.TimeLastModified).toLocaleString(),
                    ModifiedBy: file.ModifiedBy?.Title || "",
                }));

                setCurrentItems([...folderList, ...fileList]);

                setBreadcrumb((prev) => {
                    if (prev.length > 0 && prev[prev.length - 1].ServerRelativeUrl === parent.ServerRelativeUrl) {
                        return prev;
                    }
                    return [...prev, parent];
                });

                for (const folder of folderList) {
                    calculateFolderSize(folder.ServerRelativeUrl);
                }
            }
        } catch (error) {
            console.error("Error fetching folders & files:", error);
        }
    };

    const fetchItems1 = async (parent: FolderItem) => {
        try {
            const response = await fetch(
                `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${parent.ServerRelativeUrl}')?$expand=Folders,Files,Files/ModifiedBy`,
                {
                    headers: { Accept: "application/json;odata=verbose" }
                }
            );
            const data = await response.json();
            if (data.d) {
                const folderList: FolderItem[] = data.d.Folders.results.map((folder: any) => ({
                    Name: folder.Name,
                    ServerRelativeUrl: folder.ServerRelativeUrl,
                    Type: "Folder",
                    LastModified: new Date(folder.TimeLastModified).toLocaleString(),
                    ModifiedBy: folder.ModifiedBy?.Title || "",
                }));

                const fileList: FolderItem[] = data.d.Files.results.map((file: any) => ({
                    Name: file.Name,
                    ServerRelativeUrl: file.ServerRelativeUrl,
                    FileUrl: webAbsoluteUrl + file.ServerRelativeUrl,
                    Type: "File",
                    FileSize: parseInt(file.Length, 10),
                    LastModified: new Date(file.TimeLastModified).toLocaleString(),
                    ModifiedBy: file.ModifiedBy?.Title || "",
                }));

                setCurrentItems([...folderList, ...fileList]);

                setBreadcrumb((prev) => {
                    if (prev.length > 0 && prev[prev.length - 1].ServerRelativeUrl === parent.ServerRelativeUrl) {
                        return prev;
                    }
                    return [...prev, parent];
                });
            }
        } catch (error) {
            console.error("Error fetching folders & files:", error);
        }
    };

    const navigateBack = (index: number) => {
        const newBreadcrumb = breadcrumb.slice(0, index + 1);
        setBreadcrumb(newBreadcrumb);
        setCurrentItems([]);
        if (newBreadcrumb.length > 0) {
            fetchItems(newBreadcrumb[newBreadcrumb.length - 1]);
        } else {
            setCurrentItems(libraries);
        }
    };

    const openFile = (fileUrl: string) => {
        if (!fileUrl) {
            message.error("File URL not found.");
            return;
        }
        window.open(fileUrl, "_blank");
    };

    const openFiles = (fileUrl: string) => {
        const absoluteUrl = fileUrl.startsWith("http") ? fileUrl : `${window.location.origin}${fileUrl}`;
        const authUrl = `${absoluteUrl}?web=1`;
        console.log("Opening with authentication:", authUrl);
        window.open(authUrl, "_blank");
    };

    const formatFileSize1 = (size?: number) => {
        if (!size) return "";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
        return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
    };
    const formatFileSize = (size?: number) => {
        if (!size) return "Calculating...";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
        return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
    };

    const getFileIcon = (fileName: string, type: "Folder" | "File") => {
        if (type === "Folder") return <FolderOutlined style={{ color: "#fa8c16" }} />;

        const extension = fileName.split(".").pop()?.toLowerCase();

        switch (extension) {

            case "pdf":
                return <FilePdfOutlined style={{ color: "red" }} />;
            case "doc":
            case "docx":
                return <FileWordOutlined style={{ color: "blue" }} />;
            case "xls":
            case "xlsx":
                return <FileExcelOutlined style={{ color: "green" }} />;
            case "ppt":
            case "pptx":
                return <FilePptOutlined style={{ color: "orange" }} />;
            case "txt":
                return <FileTextOutlined style={{ color: "gray" }} />;
            case "md":
                return <FileMarkdownOutlined style={{ color: "purple" }} />;

            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
            case "bmp":
            case "svg":
            case "webp":
                return <FileImageOutlined style={{ color: "#13c2c2" }} />;

            case "mp4":
            case "avi":
            case "mov":
            case "wmv":
            case "flv":
            case "mkv":
                return <FileOutlined style={{ color: "#722ed1" }} />;

            case "mp3":
            case "wav":
            case "aac":
            case "flac":
            case "ogg":
                return <FileOutlined style={{ color: "#faad14" }} />;

            case "zip":
            case "rar":
            case "7z":
            case "tar":
            case "gz":
                return <FileZipOutlined style={{ color: "#d48806" }} />;

            case "js":
            case "ts":
            case "jsx":
            case "tsx":
            case "html":
            case "css":
            case "scss":
            case "json":
            case "xml":
            case "sql":
            case "py":
            case "java":
            case "c":
            case "cpp":
            case "cs":
            case "php":
            case "rb":
            case "sh":
                return <CodeOutlined style={{ color: "#1890ff" }} />;

            default:
                return <FileOutlined style={{ color: "gray" }} />;
        }
    };

    const getRequestDigest = async (): Promise<string> => {
        const digestUrl = `${webAbsoluteUrl}/_api/contextinfo`;
        try {
            const response = await fetch(digestUrl, {
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose"
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch request digest.");
            }

            const data = await response.json();
            return data.d.GetContextWebInformation.FormDigestValue;
        } catch (error) {
            console.error("Error fetching request digest:", error);
            throw error;
        }
    };

    const deleteItem = async (item: FolderItem) => {
        const deleteUrl = `${webAbsoluteUrl}/_api/web/${item.Type === "File" ? "GetFileByServerRelativeUrl" : "GetFolderByServerRelativeUrl"}('${item.ServerRelativeUrl}')`;

        try {
            const requestDigest = await getRequestDigest();

            const response = await fetch(deleteUrl, {
                method: "DELETE",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": requestDigest,
                },
            });

            if (response.ok) {
                message.success(`${item.Name} deleted successfully`);
                fetchItems(breadcrumb[breadcrumb.length - 1]);
            } else {
                const errorData = await response.json();
                message.error(`Failed to delete ${item.Name}: ${errorData.error.message.value}`);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            message.error(`Error deleting ${item.Name}`);
        }
    };

    const downloadFile = async (fileUrl: string, fileName: string) => {

        if (!fileUrl) {
            message.error("File URL not found.");
            return;
        }

        const serverRelativeUrl = fileUrl.replace(webAbsoluteUrl, "");

        const downloadApiUrl = `${webAbsoluteUrl}/_api/web/GetFileByServerRelativeUrl('${serverRelativeUrl}')/$value`;

        try {
            const response = await fetch(downloadApiUrl, {
                method: "GET",
                headers: {
                    "Accept": "application/octet-stream",
                    "X-RequestDigest": await getRequestDigest(),
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to download file. Status: ${response.status}`);
            }

            const blob = await response.blob();
            const downloadLink = document.createElement("a");
            const objectUrl = URL.createObjectURL(blob);
            downloadLink.href = objectUrl;
            downloadLink.setAttribute("download", fileName);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error("Error downloading file:", error);
            message.error("Failed to download file.");
        }
    };

    const fetchAllRecentFiles = async (libraryName: string) => {
        try {

            const libResponse = await fetch(
                `${webAbsoluteUrl}/_api/web/lists?$filter=BaseTemplate eq 101 and Title eq '${libraryName}'&$expand=RootFolder`,
                { headers: { Accept: "application/json;odata=verbose" } }
            );

            if (!libResponse.ok) throw new Error("Failed to fetch document libraries.");
            const libData = await libResponse.json();

            if (!libData.d.results.length) {
                message.error("Library not found.");
                return;
            }

            const library = libData.d.results[0];
            const libUrl = library.RootFolder.ServerRelativeUrl;

            let allFiles: FolderItem[] = [];

            const fetchFilesRecursive = async (folderUrl: string) => {
                try {

                    const fileResponse = await fetch(
                        `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')/Files?$select=Name,ServerRelativeUrl,TimeLastModified,Author/Title&$expand=Author`,
                        { headers: { Accept: "application/json;odata=verbose" } }
                    );

                    if (fileResponse.ok) {
                        const fileData = await fileResponse.json();
                        const files = fileData.d.results.map((file: any) => ({
                            Name: file.Name,
                            ServerRelativeUrl: file.ServerRelativeUrl,
                            FileUrl: `${webAbsoluteUrl}${file.ServerRelativeUrl}`,
                            LastModified: new Date(file.TimeLastModified).toISOString(),
                            ModifiedBy: file.Author?.Title || "",
                            LibraryName: libraryName,
                        }));
                        allFiles = [...allFiles, ...files];
                    }

                    const folderResponse = await fetch(
                        `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')?$expand=Folders`,
                        { headers: { Accept: "application/json;odata=verbose" } }
                    );

                    if (folderResponse.ok) {
                        const folderData = await folderResponse.json();
                        const subfolders = folderData.d.Folders.results;

                        for (const subfolder of subfolders) {
                            await fetchFilesRecursive(subfolder.ServerRelativeUrl);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching files recursively:", error);
                }
            };

            await fetchFilesRecursive(libUrl);

            allFiles.sort((a, b) => new Date(b.LastModified).getTime() - new Date(a.LastModified).getTime());

            setRecentFiles(allFiles.slice(0, 5));

            console.log("Recent Files:", allFiles.slice(0, 20));
        } catch (error) {
            console.error("Error fetching recent files:", error);
            message.error("Failed to load recently accessed files.");
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return "N/A";

        const date = new Date(isoString);
        return date.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
        });
    };

    const Backbtnclick = async () => {
        history.push("/LibraryUpload");
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }

    const handleFileUpload = async (fileList: File[]) => {
        if (breadcrumb.length === 0) {
            message.error("Please navigate to a folder before uploading.");
            return;
        }

        const currentFolder = breadcrumb[breadcrumb.length - 1].ServerRelativeUrl;

        try {
            const requestDigest = await getRequestDigest();

            const uploadPromises = fileList.map(async (file) => {
                const uploadUrl = `${webAbsoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${currentFolder}')/Files/add(overwrite=true, url='${file.name}')`;

                try {
                    const fileBuffer = await file.arrayBuffer();
                    const response = await fetch(uploadUrl, {
                        method: "POST",
                        body: fileBuffer,
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "X-RequestDigest": requestDigest,
                            "Content-Type": "application/octet-stream",
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error(`Upload failed for ${file.name}:`, errorData.error.message.value);
                        return { file, success: false, error: errorData.error.message.value };
                    }

                    return { file, success: true };
                } catch (error) {
                    console.error(`Error uploading file: ${file.name}`, error);
                    return { file, success: false, error: error.message };
                }
            });

            const results = await Promise.all(uploadPromises);
            const successFiles = results.filter((res) => res.success).map((res) => res.file.name);
            const failedFiles = results.filter((res) => !res.success).map((res) => `${res.file.name}: ${res.error}`);

            if (successFiles.length > 0) {
                message.success(`Uploaded: ${successFiles.join(", ")}`);
                fetchItems(breadcrumb[breadcrumb.length - 1]);
            }
            if (failedFiles.length > 0) {
                message.error(`Failed to upload:\n${failedFiles.join("\n")}`);
            }
        } catch (error) {
            message.error("Failed to get authentication token. Please try again.");
            console.error("Authentication Error:", error);
        }
    };

    return (
        <div>

            <Button type="primary" style={{ cursor: "pointer", color: "white", backgroundColor: "grey" }} onClick={() => Backbtnclick()} > Back </Button>

            {breadcrumb.length > 0 && (

                <Upload
                    multiple
                    beforeUpload={() => false}
                    onChange={({ fileList }) => handleFileUpload(fileList.map((file) => file.originFileObj as File))}
                    showUploadList={true}
                >
                    <Button style={{ cursor: "pointer", color: "white", backgroundColor: "red" }} icon={<UploadOutlined />} type="primary" >
                        Upload Files
                    </Button>
                </Upload>

            )}

           
            <h1>Document Libraries and Knowledge</h1><hr></hr><br></br>

            {/* {recentFiles.length > 0 && breadcrumb.length > 0 && (

                <div>
                    <h2>Recently Accessed</h2>

                    <Table
                         dataSource={recentFiles}
                        // dataSource={recentFiles.filter(item => ( item.Name!="Forms") )}

                        columns={[
                            {
                                title: "",
                                key: "FileDetails",
                                render: (_, record) => (
                                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                                        {getFileIcon(record.Name, record.Type)}
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <a onClick={() => downloadFile(record.FileUrl!, record.Name)}>
                                                {record.Name}
                                            </a>
                                            <span style={{ color: "#888", fontSize: "12px" }}>
                                                {formatDate(record.LastModified)}                        </span>
                                        </div>
                                    </div>
                                ),
                            },
                        ]}
                        rowKey="ServerRelativeUrl"
                    />
                </div>
            )} */}
{recentFiles.length > 0 && breadcrumb.length > 0 && (

    
    <div>
        <h2>Recently Accessed</h2>
     
        <Table
            dataSource={recentFiles}
            columns={[
                {
                    title: "File Details",
                    key: "FileDetails",
                    render: (_, record) => (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            {/* Show Folder Icon if it's a folder, otherwise show file icon */}
                            {record.Type === "Folder" ? (
                                <span style={{ marginRight: "10px", fontSize: "18px" }}>📁</span>
                            ) : (
                                getFileIcon(record.Name, record.Type)
                            )}
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {/* Clickable Name */}
                                <a
                                    onClick={() =>
                                        record.Type === "Folder"
                                            ? fetchItems(record) // Fetch items if it's a folder
                                            : downloadFile(record.FileUrl!, record.Name)
                                    }
                                    style={{ cursor: "pointer", color: "blue" }}
                                >
                                    {record.Name}
                                </a>
                                {/* Date Info */}
                                <span style={{ color: "#888", fontSize: "12px" }}>
                                    {formatDate(record.LastModified)}
                                </span>
                            </div>
                        </div>
                    ),
                },
            ]}
            rowKey="ServerRelativeUrl"
        />
    </div>
)}


            <div>
                <strong>Path:</strong>
                {breadcrumb.length === 0 ? " Libraries" : breadcrumb.map((item, index) => (
                    <span key={index} style={{ cursor: "pointer", color: "blue" }} onClick={() => navigateBack(index)}>
                        {" > " + item.Name}
                    </span>
                ))}
            </div>
            <h2>Folders</h2>

           
            {breadcrumb.length === 0 && (
                <ul>
                    {libraries.map((lib) => (
                        <li key={lib.Name} onClick={() => fetchItems(lib)} style={{ cursor: "pointer", color: "blue" }}>
                            📁 {lib.Name}
                        </li>
                    ))}
                </ul>
            )}
           
            {(
                <Table
                    dataSource={currentItems.filter(item => (item.Type === "Folder" && item.Name!="Forms") )}

                    
                    columns={[
                        {
                            title: "Folder Details",
                            key: "FolderDetails",
                            render: (_, record) => (
                                <div>
                                    <span
                                        onClick={() => fetchItems9(record)}
                                        style={{
                                            cursor: "pointer",
                                            color: "blue",
                                        }}
                                    >
                                        {getFileIcon(record.Name, record.Type)} {" " + record.Name}
                                    </span>
                                    <br />
                                    <span style={{ color: "#888" }}>
                                        {record.LastModified}
                                        {/* {record.ModifiedBy && <> by {record.ModifiedBy}</>} */}
                                    </span>
                                </div>
                            ),
                        },
                    ]}
                />

            )}

            {breadcrumb.length === 0 && (
                <ul>
                    {libraries.map((lib) => (
                        <li key={lib.Name} onClick={() => fetchItems(lib)} style={{ cursor: "pointer", color: "blue" }}>
                            📁 {lib.Name}
                        </li>
                    ))}
                </ul>
            )}

           
            {breadcrumb.length > 0 && (
                <Table
                    // dataSource={currentItems}
            dataSource={currentItems.filter(item => ( item.Name!="Forms") )}

                    columns={[
                        {
                            title: "Name",
                            dataIndex: "Name",
                            key: "Name",
                            render: (text, record) => (

                                // dataSource={currentItems.filter(item => (item.Type === "Folder" && item.Name!="Forms") )}

                                <span
                                    onClick={() =>
                                        record.Type === "Folder"
                                            ? fetchItems(record)
                                            : downloadFile(record.FileUrl!, record.Name)
                                    }
                                    style={{
                                        cursor: "pointer",
                                        color: record.Type === "Folder" ? "blue" : "black",
                                    }}
                                >
                                    {getFileIcon(record.Name, record.Type)} {" " + text}
                                </span>
                            ),
                        },

                        {
                            title: "Type",
                            dataIndex: "Type",
                            key: "Type",
                            render: (_, record) => {
                                const fileExtension = record.Name.split(".").pop()?.toLowerCase();

                                if (record.Type === "Folder") {
                                    return "Folder";
                                }

                                switch (fileExtension) {
                                    case "pdf":
                                        return "PDF";
                                    case "doc":
                                    case "docx":
                                        return "DOC";
                                    case "xls":
                                    case "xlsx":
                                        return "Excel";
                                    case "ppt":
                                    case "pptx":
                                        return "PowerPoint";
                                    default:
                                        return "Other";
                                }
                            },
                        },

                        {
                            title: "Size",
                            key: "Size",
                            render: (_, record) =>
                                record.Type === "Folder"
                                    ? formatFileSize(folderSizes[record.ServerRelativeUrl] || 0)
                                    : formatFileSize(record.FileSize),
                        },

                        {
                            title: "Last Edit",
                            key: "LastModifiedDetails",
                            render: (_, record) => (
                                <span>
                                    {record.LastModified}
                                    {record.ModifiedBy && (
                                        <>
                                            <br />

                                            <small style={{ color: "#888" }}>by {record.ModifiedBy}</small>
                                        </>
                                    )}
                                </span>
                            ),
                        },
                        {
                            title: "Actions",
                            key: "actions",
                            render: (_, record) =>

                            (

                                <>
                                 
                                    {record.Type === "Folder" ? (
                                        <EyeOutlined
                                            onClick={() => downloadFolderAsZip(record)}
                                            style={{ marginRight: 8, cursor: "pointer", color: "blue" }}
                                        />
                                    ) : (
                                        <EyeOutlined
                                            onClick={() => downloadFile(record.FileUrl!, record.Name)}
                                            style={{ marginRight: 8, cursor: "pointer" }}
                                        />
                                    )}


                                    {record.Type === "Folder" ? (
                                        <DownloadOutlined
                                            onClick={() => downloadFolderAsZip(record)}
                                            style={{ marginRight: 8, cursor: "pointer", color: "blue" }}
                                        />
                                    ) : (
                                        <DownloadOutlined
                                            onClick={() => downloadFile(record.FileUrl!, record.Name)}
                                            style={{ marginRight: 8, cursor: "pointer" }}
                                        />
                                    )}

                                    <Popconfirm
                                        title="Are you sure to delete this file?"
                                        onConfirm={() => deleteItem(record)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
                                    </Popconfirm>

                                </>
                            ),
                        },
                    ]}

                />
            )}
        </div>
    );
};

