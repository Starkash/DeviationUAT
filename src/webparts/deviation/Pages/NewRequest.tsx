/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/self-closing-comp */
import * as React from 'react';
import { useState } from "react";
import { Formik, FormikProps } from 'formik';
import { useHistory } from 'react-router-dom';
import EmployeeMasterOps from '../services/BAL/EmployeeMaster';
import { IDeviationProps } from '../components/IDeviationProps';
import { IEmployeeMaster } from '../services/INTERFACES/IEmployeeMaster';
import './NewRequest.css'; // Import the CSS file

export const NewRequest: React.FunctionComponent<IDeviationProps> = (props: IDeviationProps) => {
    const history = useHistory();
    const [EmployeeMasterCollData, setEmployeeMasterCollData] = useState<IEmployeeMaster[]>();
    const [currentDate, setCurrentDate] = useState(getDate());

    function getFieldProps(formik: FormikProps<any>, field: string) {
        return { ...formik.getFieldProps(field), errorMessage: formik.errors[field] as string };
    }

    function getDate() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const date = today.getDate();
        return `${date}/${month}/${year}`;
    }

    React.useEffect(() => {
        // eslint-disable-next-line prefer-const
        let Currentloggedinuser = props.currentSPContext.pageContext.legacyPageContext.userEmail;
        EmployeeMasterOps().getEmployeeMasterData(Currentloggedinuser, props).then((EMPColl) => {
            setEmployeeMasterCollData(EMPColl);
        }, error => {
            console.log(error);
        });
    }, []);

    return (
        <Formik initialValues={{ DeviationRequest: '', Attachment: '' }}
            validationSchema={""} // Add your validation schema here.
            onSubmit={(values: any, helpers: any) => {
                // Handle form submission
                console.log(values);
            }}
        >
            {(formik: any) => (
                <div className="new-request-container">
                    <div className='form-group row'>
                        <div className='col-md-3'>
                            <label className='col-form-label'>Initiator Name</label>
                            <div>
                                <input
                                    type="text" 
                                    className="form-control" {...getFieldProps(formik, 'InitiatorNAme')}
                                    value={EmployeeMasterCollData !== undefined && EmployeeMasterCollData[0] !== undefined ? EmployeeMasterCollData[0].Title : ''}
                                    readOnly
                                />
                            </div>
                        </div>
                        <br></br>

                        <div className='col-md-3'>
                            <label className='col-form-label'>Date of Request</label>
                            <div>
                                <input
                                    type="text" {...getFieldProps(formik, 'DateOfRequest')}
                                    className="form-control"
                                    value={currentDate}
                                    readOnly
                                />
                            </div>
                        </div>
                        <br></br>

                        <div className='col-md-3'>
                            <label className='col-form-label'>Department</label>
                            <div>
                                <input
                                    type="text"
                                    className="form-control"  {...getFieldProps(formik, 'Department')}
                                    value={EmployeeMasterCollData !== undefined && EmployeeMasterCollData[0] !== undefined ? EmployeeMasterCollData[0].Department : ''}
                                    readOnly
                                />
                            </div>
                        </div>
                        <br></br>

                    </div>

                    <br>
                    </br>

                    <br>
                    </br>
                    <br>
                    </br>

                    <div>
                        <div className='form-group row'>
                            <div className='col-md-6'>
                                <label className='col-form-label'>Deviation Request <span className="text-danger">*</span></label>
                                <div>
                                    <textarea id='txtDeviationRequest' className='form-control' {...getFieldProps(formik, 'DeviationRequest')} />
                                </div>
                            </div>
                            <br></br>
                            <br></br>



                            <div className='col-md-6'>
                                <label className='col-form-label'>Attachment <span className="text-danger">*</span></label>
                                <div>
                                    <input type="file" multiple className="form-control" {...getFieldProps(formik, 'Attachment')} />
                                    
                                </div>
                            </div>
                        </div>
                    </div>

<br></br>


<br></br>


                    <div className="form-group row justify-content-center">
                        <button type="submit" className="btn btn-primary mx-2">Submit</button>
                        <button type="button" className="btn btn-secondary mx-2" onClick={() => history.push('/')}>Exit</button>
                    </div>

                </div>

                
            )}
        </Formik>
    );
};
