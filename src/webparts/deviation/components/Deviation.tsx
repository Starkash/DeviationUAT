import * as React from 'react';
import styles from './Deviation.module.scss';
import type { IDeviationProps } from './IDeviationProps';
import { escape } from '@microsoft/sp-lodash-subset';

import { NewRequest } from '../Pages/NewRequest';
// import { HashRouter, Route, Switch } from 'react-router-dom';
import { BrowserRouter as Router, Switch, Route, Link, HashRouter, match, useParams, Redirect } from 'react-router-dom';


export default class Deviation extends React.Component<IDeviationProps, {}> {
  public render(): React.ReactElement<IDeviationProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName,
      
    } = this.props;

    return (
      <section className={`${styles.deviation} ${hasTeamsContext ? styles.teams : ''}`}>
        <div id='divBlockRequestsLoader' className={'blockRequestLoader'}></div>

        <div>
        <HashRouter>
                <Switch>                 
                  <Route path='/' exact={true}  render={() => <NewRequest  {...this.props} />} />
                  {/* <Route path='/RequestForm' exact={true}  render={() => <NewRequest  {...this.props} />} /> */}
                  {/* <Route path='/RquestBDFormView' exact={true}  render={() => <MedRedFormView  {...this.props} />} />
                  <Route path='/MedRegLanding' exact={true}  render={() => <MedRegLanding  {...this.props} />} />
                  
                  <Route path='/ApproverLanding' exact={true}  render={() => <ApproverLanding  {...this.props} />} />
                   <Route path='/InitiatorLanding' exact={true}  render={() => <InitiatorLanding  {...this.props} />} />
                   <Route path='/BDLanding' exact={true}  render={() => <BDLanding  {...this.props} />} />
                  <Route path='/ApproverForm/:ArtIntId' exact={true}  render={() => <ApproverForm  {...this.props} />} />
                  
                  <Route path='/BDUpload/:ArtIntId' exact={true}  render={() => <BDUploadDocForm  {...this.props} />} />
                  <Route path='/MedRedFormView/:ArtIntId' exact={true}  render={() => <MedRedFormView  {...this.props} />} />
                  <Route path='/InititatorSubmission/:ArtIntId' exact={true}  render={() => <InititatorSubmission  {...this.props} />} />
                  <Route path='/EditRequest/:ArtIntId' exact={true}  render={() => <EditRequest  {...this.props} />} />
                  
                  <Route path='/RequestAttached/:ArtIntId' exact={true}  render={() => <RequestAttached  {...this.props} />} />
                  <Route path='/RequestInitiatedView/:ArtIntId' exact={true}  render={() => <RequestInitiatedView  {...this.props} />} />
                  <Route path='/BDUploadView/:ArtIntId' exact={true}  render={() => <BDUploadView  {...this.props} />} />
                  <Route path='/ApproverFormView/:ArtIntId' exact={true}  render={() => <ApproverFormView  {...this.props} />} />
                  <Route path='/RequestViewForm/:ArtIntId' exact={true}  render={() => <RequestViewForm  {...this.props} />} />
                  <Route path='/MREANCODEView/:ArtIntId' exact={true}  render={() => <MREANCODEView  {...this.props} />} />
                  <Route path='/ApproverFormReject/:ArtIntId' exact={true}  render={() => <ApproverFormReject  {...this.props} />} />
                  <Route path='/HarmonyLanding' exact={true}  render={() => <HarmonyLanding  {...this.props} />} />
                  <Route path='/Harmonyview/:ReferenceNo' exact={true}  render={() => <HarmonyView  {...this.props} />} />
                  <Route path='/SendBackMarketing/:ArtIntId' exact={true}  render={() => <SendBackMarketing  {...this.props} />} /> */}

                  
                </Switch>
              </HashRouter>
       
          
       



        </div>
      </section>
    );
  }
}
