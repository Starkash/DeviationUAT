import { WebPartContext } from "@microsoft/sp-webpart-base";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IDeviationProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  currentSPContext?: any;


}
