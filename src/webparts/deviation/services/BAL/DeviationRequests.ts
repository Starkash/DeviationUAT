
import { IDeviationRequests } from '../INTERFACES/IDeviationRequests'
import { IDeviationProps } from "../../components/IDeviationProps";
import SPCRUDOPS from "../DAL/spcrudops";

export interface IDeviationRequestsOps {
    getDeviationRequestsData(props: IDeviationRequests): Promise<IDeviationRequests>;
}

export default function DeviationRequestsOps() {
    const spCrudOps = SPCRUDOPS();

const getDeviationRequestsData = async (props: IDeviationProps): Promise<IDeviationRequests[]> => {
        return await (await spCrudOps).getData("DeviationRequests"
            , "*"
            , ""
            ,""
            
           , { column: 'Order0', isAscending: true },
             props).then(results => {
                let brr: Array<IDeviationRequests> = new Array<IDeviationRequests>();
                results.map((item: { Id: any; RequestStatus: any; InitiatorName: any; DeviationIntID: any; DateofIssuance: any; Department: any; DeviationRequest: any; DeviationType: any; Classification: any; DecriptionofDeviation: any; ProbablerootcauseofDeviation: any; ImpactEvaluation: any; CorrectiveAction: any; PreventiveAction: any; }) => {
                    brr.push({
                        Id:item.Id,
                        RequestStatus: item.RequestStatus,
                        InitiatorName:item.InitiatorName, 
                        DeviationNo:item.DeviationIntID,
                        DateofIssuance :item.DateofIssuance,
                        Department :item.Department,
                        DeviationRequest :item.DeviationRequest,
                        DeviationType:item.DeviationType,
                        Classification:item.Classification,
                        DecriptionofDeviation:item.DecriptionofDeviation,
                        ProbablerootcauseofDeviation:item.ProbablerootcauseofDeviation,
                        ImpactEvaluation:item.ImpactEvaluation,
                        CorrectiveAction:item.CorrectiveAction,
                        PreventiveAction:item.PreventiveAction
                       
                    });
                });
                return brr;
            }
            );
    //});
};



   return {
    getDeviationRequestsData
    };
}
