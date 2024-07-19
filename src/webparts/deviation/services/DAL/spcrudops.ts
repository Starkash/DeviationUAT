
import {  Web } from "@pnp/sp/presets/all";
import { sp } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { ConsoleListener, Logger, LogLevel } from "@pnp/logging";
import { IDeviationProps } from "../../components/IDeviationProps";
// import { SPHttpClient } from 'http-client';

export interface ISPCRUDOPS {
    getData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
        , orderby: { column: string, isAscending: boolean}, props: IDeviationProps): Promise<any>;
    insertData(listName: string, data: any, props: IDeviationProps): Promise<any>;
    updateData(listName: string, itemId: number, data: any, props: IDeviationProps): Promise<any>;
    deleteData(listName: string, itemId: number, props: IDeviationProps): Promise<any>;
    getListInfo(listName: string, props: IDeviationProps): Promise<any>;
    getListData(listName: string, columnsToRetrieve: string, props: IDeviationProps): Promise<any>;
    batchInsert(listName: string, data: any, props: IDeviationProps): Promise<any>;
    batchUpdate(listName: string, data: any, props: IDeviationProps): Promise<any>;
    batchDelete(listName: string, data: any, props: IDeviationProps): Promise<any>;
    createFolder(listName: string, folderName: string, props: IDeviationProps):Promise<any>;
    uploadFile(folderServerRelativeUrl: string, file: File, props: IDeviationProps): Promise<any>;
    deleteFile(fileServerRelativeUrl: string, props: IDeviationProps): Promise<any>;
    currentProfile(props: IDeviationProps): Promise<any>;
    //currentUserProfile(props: IDeviationProps): Promise<any>;
    getLoggedInSiteGroups(props: IDeviationProps): Promise<any>;
    getAllSiteGroups(props: IDeviationProps): Promise<any>;
    getTopData(listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string
        , orderby: { column: string, isAscending: boolean }, top: number, props: IDeviationProps): Promise<any>;
   // getLeaveData(props: IDeviationProps): Promise<any>;
}

export default async function SPCRUDOPS(): Promise<ISPCRUDOPS> {
    // const getLeaveData = async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: {column: string, isAscending: boolean}, props: IDeviationProps) => {
    //     let web ="https://dv5api.iniitian.com/api/leave/GetTeamList?empno=00015112"
    //     // Web("https://etgworld.sharepoint.com/sites/UAT_BPM");
    //     const items: any[];// = await web.lists.getByTitle(listName).items.select(columnsToRetrieve).expand(columnsToExpand).filter(filters).orderBy(orderby.column, orderby.isAscending).getAll();
    //     return items;
    // };

    const getData = async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: {column: string, isAscending: boolean}, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const items: any[] = await web.lists.getByTitle(listName).items.select(columnsToRetrieve).expand(columnsToExpand).filter(filters).orderBy(orderby.column, orderby.isAscending).getAll();
        return items;
    };

    const insertData = async (listName: string, data: any, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).items.add(data).then(result => {
            return result;
        });
    };

    const updateData = async (listName: string, itemId: number, data: any, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).items.getById(itemId).update(data).then(result => {
            return result;
        });
    };

    const deleteData = async (listName: string, itemId: number, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).items.getById(itemId).delete().then(result => {
            return result;
        });
    };

    const getListInfo = async (listName: string, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const list = await web.lists.getByTitle(listName);
        const listInfo = await list.select("Id,Title")();

        return listInfo;
    };
   
    const getListData = async (listName: string, columnsToRetrieve: string, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const list = await web.lists.getByTitle(listName).items.select(columnsToRetrieve);
        //const listInfo = await list.select("Id,Title")();

        return list;
    };

    const batchInsert = async (listName: string, data: any, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        let list = web.lists.getByTitle(listName);
        const entityTypeFullName = await list.getListItemEntityTypeFullName();
        let batch = web.createBatch();

        for (let d = 0; d < data.length; d++) {
            await list.items.inBatch(batch).add(data[d], entityTypeFullName).then(b => {
                console.log(b);
            },error =>
            {
                console.log(error);
            });
        }

        return await batch.execute();
    };

    const batchUpdate = async (listName: string, data: any, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        let list = web.lists.getByTitle(listName);
        const entityTypeFullName = await list.getListItemEntityTypeFullName();
        let batch = web.createBatch();

        for (let d = 0; d < data.length; d++) {
            await list.items.getById(data[d].Id).inBatch(batch).update(data[d], entityTypeFullName).then(b => {
                console.log(b);
            });
        }

        return await batch.execute();
    };

    const batchDelete = async (listName: string, data: any, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        let list = web.lists.getByTitle(listName);
       // const entityTypeFullName = await list.getListItemEntityTypeFullName();
        let batch = web.createBatch();

        for (let d = 0; d < data.length; d++) {
            await list.items.getById(data[d].Id).inBatch(batch).delete().then(b => {
                console.log(b);
            });
            
        }

        return await batch.execute();
    };


    const createFolder = async (listName: string, folderName: string, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        return await web.lists.getByTitle(listName).rootFolder.folders.add(folderName).then(result => {
            return result;
        });
    };

    const uploadFile = async (folderServerRelativeUrl: string, file: File, props: IDeviationProps) => {
        Logger.subscribe(new ConsoleListener());
        Logger.activeLogLevel = LogLevel.Verbose;

        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        let ticks = ((new Date().getTime() * 10000) + 621355968000000000);
        return await web.getFolderByServerRelativeUrl(folderServerRelativeUrl).files.addChunked(ticks.toString() + "_" + file.name, file, data => {
            Logger.log({ data: data, level: LogLevel.Verbose, message: "progress" });
        }, true);
    };

    

    const deleteFile = async (fileServerRelativeUrl: string, props: IDeviationProps) => {
        Logger.subscribe(new ConsoleListener());
        Logger.activeLogLevel = LogLevel.Verbose;

        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);

        return await web.getFileByServerRelativeUrl(fileServerRelativeUrl).delete().then(result => {
            return result;
        });
    };
    const currentProfile1 = async (props: IDeviationProps) => {
        //https://maricoglobal.sharepoint.com/sites/intranet/_api
       // let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
       
        return await sp.profiles.myProperties.get().then((response)=>{
            
        //     return await web.currentUser.get().then((response)=>{
            //    return await web.currentUser.get().then((response)=>{
                console.log(response);
            return response;
          })
    };
    const currentProfile = async (props: IDeviationProps) => {
        // return await sp.profiles.myProperties.get().then((response)=>{
        //     //return await sp.web.currentUser.get().then((response)=>{
        //         console.log(response);
        //     return response;
        //   })
        let web =Web("https://maricoglobal.sharepoint.com/sites/intranet");//  Web(props.context.pageContext.site.absoluteUrl);
// let curruser = web.currentUser.get().then(function(res){ 
// console.log(res.Title); })
const avatar = `${"https://maricoglobal.sharepoint.com/sites/intranet"}/_layouts/15/userphoto.aspx?size=L&username=${'ajit.anchan@marico.com'}`
//const resultsNew : string =await web + "_api/navigation/menustate?mapprovidername='GlobalNavigationSwitchableProvider'&$filter=IsHidden eq 'false'"+get();
//const ProfileItems: any[] = await sp.web.currentUser.get();
return avatar;
          
    };
   //Current User Belongs which Site Group    
    const getLoggedInSiteGroups = async (props: IDeviationProps) => {
        //let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const groupsItems: any[] = await web.currentUser.groups();
        return groupsItems;
    };

//Get All Group Name from Site

    const getAllSiteGroups = async (props: IDeviationProps) => {
        //let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
       // let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
       const groupsItems: any[] =await sp.web.siteGroups();
        return groupsItems;
    };

    const getTopData = async (listName: string, columnsToRetrieve: string, columnsToExpand: string, filters: string, orderby: { column: string, isAscending: boolean }, top: number, props: IDeviationProps) => {
        let web = Web(props.currentSPContext.pageContext.web.absoluteUrl);
        const items: any[] = await web.lists.getByTitle(listName).items.select(columnsToRetrieve).expand(columnsToExpand).filter(filters).orderBy(orderby.column, orderby.isAscending).top(top)();
        return items;
    };
    return {
        getData,
        insertData,
        updateData,
        deleteData,
        getListInfo,
        getListData,
        batchInsert,
        batchUpdate,
        batchDelete,
        createFolder,
        uploadFile,
        deleteFile,
        currentProfile,
        //currentUserProfile,
        getLoggedInSiteGroups,
        getAllSiteGroups,
        getTopData
    };
}