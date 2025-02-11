/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// import { IDeviationProps } from '../../components/IDeviationProps';
// import SPCRUDOPS from '../DAL/spcrudops';
// import { ILibraryUpload } from '../INTERFACES/ILibraryUpload'

// export interface ILibraryUploadOps {
//     getLibraryUploadData(props: ILibraryUpload): Promise<ILibraryUpload>;
// }


// export default function LibraryUploadOps() {
//     const spCrudOps = SPCRUDOPS();

// const getLibraryUploadData = async (props: IDeviationProps): Promise<ILibraryUpload[]> => {
//         return await (await spCrudOps).getData(""
//             , "*,"
//             , ""
//             ," eq '"+ +"'"
            
//            , { column: 'Id', isAscending: true },
//              props).then(results => {
//                 let brr: Array<ILibraryUpload> = new Array<ILibraryUpload>();
//                 results.map((item: { Id: any;Title:any, Department: any; DepartmentId: number; EmployeeEmail:any;InitiatorName:any}) => {
//                     brr.push({
//                         Id:item.Id,
                       
//                         Title:item.Title
                       
//                     });
//                 });
//                 return brr;
//             }
//             );
//     //});
// };



//    return {
//     getLibraryUploadData
//     };
// }


// import { IDeviationProps } from '../../components/IDeviationProps';
// import SPCRUDOPS from '../DAL/spcrudops';
// import { IEmployeeMaster } from '../INTERFACES/IEmployeeMaster'

// export interface IEmployeeMasterOps {
//     getEmployeeMasterData(props: IEmployeeMaster): Promise<IEmployeeMaster>;
// }


// export default function EmployeeMasterOps() {
//     const spCrudOps = SPCRUDOPS();

// const getEmployeeMasterData = async (CurrentLogin:any,props: IDeviationProps): Promise<IEmployeeMaster[]> => {
//         return await (await spCrudOps).getData("EmployeeMaster"
//             , "*,Department/Id,Department/Title"
//             , "Department"
//             ,"EmployeeEmail eq '"+ CurrentLogin +"'"
            
//            , { column: 'Id', isAscending: true },
//              props).then(results => {
//                 let brr: Array<IEmployeeMaster> = new Array<IEmployeeMaster>();
//                 results.map((item: { Id: any;Title:any, Department: any; DepartmentId: number; EmployeeEmail:any;InitiatorName:any}) => {
//                     brr.push({
//                         Id:item.Id,
//                         Department:item.Department!==undefined ? item.Department.Title:'',
//                         DepartmentId:item.DepartmentId,
//                         EmployeeEmail:item.EmployeeEmail,
//                         InitiatorName:item.InitiatorName,
//                         Title:item.Title
                       
//                     });
//                 });
//                 return brr;
//             }
//             );
//     //});
// };




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

