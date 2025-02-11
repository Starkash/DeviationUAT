import { IDeviationProps } from '../../components/IDeviationProps';
import SPCRUDOPS from '../DAL/spcrudops';
import { ILibraryUpload } from '../INTERFACES/ILibraryUpload';

export interface ILibraryUploadOps {
    getLibraryUploadData(props: IDeviationProps): Promise<ILibraryUpload[]>;
}

export default function LibraryUploadOps() {
    const spCrudOps = SPCRUDOPS();

    const getLibraryUploadData = async (props: IDeviationProps): Promise<ILibraryUpload[]> => {
        return await (await spCrudOps).getData(
            "Banking",  // Replace with actual library name
            "Id,Modified,FileLeafRef,FileDirRef,FSObjType,File_x0020_Type,Modified,Editor/Title,File/Length", // Include File Size
            "Editor,File", // Expand Editor & File
            "FSObjType eq 0 or FSObjType eq 1", // Fetch files and folders
            { column: 'Modified', isAscending: false },
            props
        ).then(results => {
            let brr: ILibraryUpload[] = [];
    
            results.map((item: { 
                Id: number; 
                FileLeafRef: string; 
                FileDirRef: string;  
                FSObjType: number; 
                File_x0020_Type?: string;
                Modified: string;
                Editor: { Title: string };
                File?: { Length: number };  // File size (only for files)
            }) => {
                brr.push({
                    Id: item.Id,
                    Size: item.File?.Length ? `${(item.File.Length / 1024).toFixed(2)} KB` : (item.FSObjType === 1 ? "Folder" : "N/A"), // Convert bytes to KB
                    Title: item.FileLeafRef, // File/Folder Name
                    Path: item.FileDirRef, // Folder Path
                    Type: item.FSObjType === 1 ? "Folder" : "File",
                    FileType: item.File_x0020_Type || "",
                    Modified: item.Modified,
                    ModifiedBy: item.Editor?.Title || "Unknown",
                    FileLeafRef: undefined,
                    FileDirRef: undefined,
                    FSObjType: undefined,
                    Editor: {
                        Title: undefined
                    }
                });
            });
    
            return brr;
        });
    };

    return {
        getLibraryUploadData
    };
}

