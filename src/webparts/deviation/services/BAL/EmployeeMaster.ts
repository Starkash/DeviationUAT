import { IDeviationProps } from '../../components/IDeviationProps';
import SPCRUDOPS from '../DAL/spcrudops';
import { IEmployeeMaster } from '../INTERFACES/IEmployeeMaster'

export interface IEmployeeMasterOps {
    getEmployeeMasterData(props: IEmployeeMaster): Promise<IEmployeeMaster>;
}

export default function EmployeeMasterOps() {
    const spCrudOps = SPCRUDOPS();

const getEmployeeMasterData = async (props: IDeviationProps): Promise<IEmployeeMaster[]> => {
        return await (await spCrudOps).getData("EmployeeMaster"
            , "*,Department/Id,Department/Title,"
            , "Department"
            ,""
            
           , { column: 'Order0', isAscending: true },
             props).then(results => {
                let brr: Array<IEmployeeMaster> = new Array<IEmployeeMaster>();
                results.map((item: { Id: any;Title:any, Department: any; DepartmentId: number; EmployeeEmail:any;InitiatorName:any}) => {
                    brr.push({
                        Id:item.Id,
                        Department:item.Department,
                        DepartmentId:item.DepartmentId,
                        EmployeeEmail:item.EmployeeEmail,
                        InitiatorName:item.InitiatorName,
                        Title:item.Title
                       
                    });
                });
                return brr;
            }
            );
    //});
};



   return {
    getEmployeeMasterData
    };
}
