import { IDeviationProps } from '../../components/IDeviationProps';
import SPCRUDOPS from '../DAL/spcrudops';
import { IRoleMaster } from '../INTERFACES/IRoleMaster'

export interface IRoleMasterOps {
    getRoleMasterData(props: IRoleMaster): Promise<IRoleMaster>;
}

export default function RoleMasterOps() {
    const spCrudOps = SPCRUDOPS();

const getRoleMasterData = async (props: IDeviationProps): Promise<IRoleMaster[]> => {
        return await (await spCrudOps).getData("RoleMaster"
            , "*"
            , ""
            ,""
            
           , { column: 'Order0', isAscending: true },
             props).then(results => {
                let brr: Array<IRoleMaster> = new Array<IRoleMaster>();
                results.map((item: { Id: any; RoleName: any; Status: any; }) => {
                    brr.push({
                        Id:item.Id,
                        RoleName: item.RoleName,
                        Status:item.Status
                       
                    });
                });
                return brr;
            }
            );
    //});
};



   return {
    getRoleMasterData
    };
}
