import * as React from 'react';

import { useState } from "react";
import { SPComponentLoader } from '@microsoft/sp-loader';

import { escape } from '@microsoft/sp-lodash-subset';
import { Formik, FormikProps, FieldArray, ErrorMessage, Field } from 'formik';
import { sp, IFolders, Folders } from "@pnp/sp/presets/all";

import { IDeviationProps } from '../components/IDeviationProps';
import { IEmployeeMaster } from '../services/INTERFACES/IEmployeeMaster';
import { ISPCRUD } from '../services/BAL/SPCRUD/spcrud';
import EmployeeMasterOps from '../services/BAL/EmployeeMaster';
import { Link, useHistory } from 'react-router-dom';



export const NewRequest: React.FunctionComponent<IDeviationProps> = (props: IDeviationProps) => {
    let SelectedComponent = [];
    const history = useHistory();
    const [spCrud, setSPCRUD] = React.useState<ISPCRUD>();
    const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);

    const [EmployeeMasterCollData, setEmployeeMasterCollData] = React.useState<IEmployeeMaster[]>();


    function getFieldProps(formik: FormikProps<any>, field: string) {
        return { ...formik.getFieldProps(field), errorMessage: formik.errors[field] as string };
      }

    React.useEffect(() => {

        let resultarr = [];
        EmployeeMasterOps().getEmployeeMasterData(props).then((EMPColl) => {
            console.log(EMPColl);
            setEmployeeMasterCollData(EMPColl);
        }, error => {
            console.log(error);
        });

    }, []);

    return (
        <Formik initialValues={ ""}
            validationSchema={ ""}

            onSubmit={(values: any, helpers: any) => { }}>{
                (formik: any) => (
                    // <section >

                    <div>
                    <div className='p-3 bg-white shadow-sm border'>
                      {/* <h1 className={styles.headingh1}>Product Information</h1> */}
                      <div className='form-group row'>
                        <div className='col-md-4'>
                          <label className='col-form-label'>Initiator Name</label>
                          <div>
                            <input type='text' id='txtInitiatorname' className='form-control'  {...getFieldProps(formik, 'InitiatorName')}></input>
    
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <label className='col-form-label'>Date of Request   </label>
                          <div>
                            <input type='date' id='txtDateOfRequest' className='form-control'  {...getFieldProps(formik, 'DateOfRequest')}></input>
    
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <label className='col-form-label'>Department</label>
                          <div>
                            <input type='text' id='txtDepartment' className='form-control' {...getFieldProps(formik, 'Department')}></input>
                            {formik.errors.Department ? (
                              <div
                                style={{
                                  paddingTop: 0,
                                  color: "#B2484D",
                                  fontSize: ".75rem",
                                  fontFamily: "Segoe UI"
                                }}
                              >
                                {JSON.stringify(formik.errors.Department).replace(/"/g, '')}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
            
                      <div className='form-group row'>
                        <div className='col-md-4'>
                          <label className='col-form-label'>Deviation Request</label>
                          <div>
                            <input type='text' id='txtDeviationRequest' className='form-control'  {...getFieldProps(formik, 'DeviationRequest')}></input>
    
                          </div>
                        </div>
                        
                      </div>
                     

                    </div>
                   
                  
                  </div>
)}
        </Formik>

)

}