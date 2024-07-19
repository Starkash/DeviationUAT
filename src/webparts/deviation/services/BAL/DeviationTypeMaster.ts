import { IDeviationProps } from '../../components/IDeviationProps';
import SPCRUDOPS from '../DAL/spcrudops';
import { IDeviationTypeMaster } from '../INTERFACES/IDeviationTypeMaster'

export interface IDeviationTypeMasterOps {
    getDeviationTypeMasterData(props: IDeviationTypeMaster): Promise<IDeviationTypeMaster>;
}

export default function DeviationTypeMasterOps() {
    const spCrudOps = SPCRUDOPS();

const getDeviationTypeMasterData = async (props: IDeviationProps): Promise<IDeviationTypeMaster[]> => {
        return await (await spCrudOps).getData("DeviationTypeMaster"
            , "*"
            , ""
            ,""
            
           , { column: 'Order0', isAscending: true },
             props).then(results => {
                let brr: Array<IDeviationTypeMaster> = new Array<IDeviationTypeMaster>();
                results.map((item: { Id: any; DeviationType: any; }) => {
                    brr.push({
                        Id:item.Id,
                        DeviationType: item.DeviationType,
                       
                    });
                });
                return brr;
            }
            );
    //});
};



   return {
    getDeviationTypeMasterData
    };
}
