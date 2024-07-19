import { IDeviationProps } from '../../components/IDeviationProps';
import SPCRUDOPS from '../DAL/spcrudops';
import { IGroupMaster } from '../INTERFACES/IGroupMaster'

export interface IGroupMasterOps {
    getGroupMasterData(props: IGroupMaster): Promise<IGroupMaster>;
}

export default function GroupMasterOps() {
    const spCrudOps = SPCRUDOPS();

const getGroupMasterData = async (props: IDeviationProps): Promise<IGroupMaster[]> => {
        return await (await spCrudOps).getData("GroupMaster"
            , "*"
            , ""
            ,""
            
           , { column: 'Order0', isAscending: true },
             props).then(results => {
                let brr: Array<IGroupMaster> = new Array<IGroupMaster>();
                results.map((item: { Id: any; GroupName: any; Status: any; }) => {
                    brr.push({
                        Id:item.Id,
                        GroupName: item.GroupName,
                        Status:item.Status

                       
                    });
                });
                return brr;
            }
            );
    //});
};



   return {
    getGroupMasterData
    };
}
