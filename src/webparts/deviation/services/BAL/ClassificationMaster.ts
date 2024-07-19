import { IDeviationProps } from "../../components/IDeviationProps";
import SPCRUDOPS from "../DAL/spcrudops";
import { IClassificationMaster } from "../INTERFACES/IClassificationMaster"

export interface IClassificationMasterOps {
    getClassificationMasterData(props: IClassificationMaster): Promise<IClassificationMaster>;
}

export default function ClassificationMasterOps() {
    const spCrudOps = SPCRUDOPS();

const getClassificationMasterData = async (props: IDeviationProps): Promise<IClassificationMaster[]> => {
        return await (await spCrudOps).getData("ClassificationMaster"
            , "*"
            , ""
            ,""
            
           , { column: 'Order0', isAscending: true },
             props).then(results => {
                let brr: Array<IClassificationMaster> = new Array<IClassificationMaster>();
                results.map((item: { Id: any; Classification: any; }) => {
                    brr.push({
                        Id:item.Id,
                        Classification: item.Classification
                       
                    });
                });
                return brr;
            }
            );
    //});
};



   return {
    getClassificationMasterData
    };
}
