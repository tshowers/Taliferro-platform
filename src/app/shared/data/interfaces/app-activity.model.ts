/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: AppActivity
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/
export interface AppActivity {
  login?: Login;
  logout?: Logout;
  status?: string;
  timeDifference: number;
}

export interface Login {
  name: string;
  start: number;
}
export interface Logout {
  name: string;
  end: number;
}
