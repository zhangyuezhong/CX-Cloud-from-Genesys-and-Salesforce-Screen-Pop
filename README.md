# CX-Cloud-from-Genesys-and-Salesforce-Screen-Pop

CX Cloud from Genesys and Salesforce has a limitation in that it only supports screen popping of built-in voice call records and contact records via [Object Linking](https://developer.salesforce.com/docs/atlas.en-us.voice_pt_developer_guide.meta/voice_pt_developer_guide/voice_pt_record_linking.htm).

However, some customers prefer to screen pop objects other than the Contact object, such as Account (Personal Account).

This project leverages Flow for Record Linking and a Lightning Web Component (LWC) to open the linked records as subtabs (screen pop).

# Configuration of Salesforce

1.  From Setup, enter Channel-Object in the Quick Find box, then select **Channel-Object Linking**.
2.  Turn off the Channel-Object Linking or disable the Channel-Object Linking Rules for Phone.
3.  From Setup, enter **Partner Telephony Setup**, scroll the page to the bottom and find **Match Callers to End User Records** (Turn Off).

## Deployment

In VSCode, right-click on the manifest (package.xml) and select **SFDX: Deploy Source in Manifest to Org** to deploy the source to your Salesforce organization.

## What will be deployed ?

- **Flow: Voice_Call_Set_Related_Record**  
  When a Voice Call record is created, this flow will be triggered. The flow searches for an Account by matching the phone number to the `FromPhoneNumber` field of the Voice Call. If a match is found, the flow will update the Voice Call’s "Related Record" field with the corresponding Account.   (You may need to change this flow based your business requirement)

- **LWC Component: voiceCallOpenRelatedRecordAsSubTab**  
  Please edit your Voice Call Lightning record page and add the `voiceCallOpenRelatedRecordAsSubTab` component to the page. You can place it anywhere on the page, as this component doesn't display any content. It simply provides functionality to open related records in a subtab.
