import { IDeviationProps } from "../../components/IDeviationProps";
import SPCRUDOPS from "../DAL/spcrudops";
import { IApproverMaster } from "../INTERFACES/IApproverMaster"

export interface IApproverMasterOps {
    getApproverMasterData(props: IApproverMaster): Promise<IApproverMaster>;
}

export default function ApproverMasterOps() {
    const spCrudOps = SPCRUDOPS();

const getApproverMasterData = async (props: IDeviationProps): Promise<IApproverMaster[]> => {
        return await (await spCrudOps).getData("ApproverMaster"
            , "*"
            , ""
            ,""
            
           , { column: 'Order0', isAscending: true },
             props).then(results => {
                let brr: Array<IApproverMaster> = new Array<IApproverMaster>();
                results.map((item: { GroupName: any; RoleName: any; ApproverName: any; ApproverStatus: any; Remarks: any; DeviationIntID: any; Id: any; }) => {
                    brr.push({
                        GroupName   :item.GroupName,
                        RoleName :item.RoleName,
                        ApproverName:item.ApproverName,
                        ApproverStatus:item.ApproverStatus,
                        Remarks :item.Remarks,
                        DeviationIntID  :item.DeviationIntID, 
                        Id:item.Id
                       
                    });
                });
                return brr;
            }
            );
    //});
};



   return {
    getApproverMasterData
    };
}
