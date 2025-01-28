import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import {
  EnclosingTabId,
  getTabInfo,
  openSubtab,
  IsConsoleNavigation
} from "lightning/platformWorkspaceApi";

import { log } from "lightning/logger";

import RELATED_RECORD_FIELD from "@salesforce/schema/VoiceCall.RelatedRecordId";

export default class VoiceCallOpenRelatedRecordAsSubTab extends LightningElement {
  @api recordId;

  isConsoleNavigation = false;
  tabId;
  relatedRecordId;

  // Constructor to log the component initialization
  constructor() {
    super();
    log({
      msg: "voiceCallOpenRelatedRecordAsSubTab: Component is being initialized.",
      version: "v3.0.1"
    });
  }

  @wire(IsConsoleNavigation)
  wiredConsoleNavigation(isConsoleNavigation) {
    if (isConsoleNavigation) {
      this.isConsoleNavigation = isConsoleNavigation;
      log({
        msg: "voiceCallOpenRelatedRecordAsSubTab: Successfully retrieved isConsoleNavigation.",
        isConsoleNavigation: this.isConsoleNavigation
      });
    }
  }

  @wire(EnclosingTabId)
  wiredTabId(tabIdResult) {
    if (tabIdResult) {
      this.tabId = tabIdResult;
      log({
        msg: "voiceCallOpenRelatedRecordAsSubTab: Successfully retrieved tabId.",
        tabId: this.tabId
      });
    }
  }

  // Reactively handle when relatedRecordId is available
  @wire(getRecord, { recordId: "$recordId", fields: [RELATED_RECORD_FIELD] })
  wiredRecord(recordResult) {
    if (recordResult && recordResult.data) {
      this.relatedRecordId = getFieldValue(
        recordResult.data,
        RELATED_RECORD_FIELD
      );
      log({
        msg: "voiceCallOpenRelatedRecordAsSubTab: Successfully retrieved relatedRecordId.",
        relatedRecordId: this.relatedRecordId
      });
    } else if (recordResult && recordResult.error) {
      log({
        msg: "voiceCallOpenRelatedRecordAsSubTab: Error retrieving relatedRecordId.",
        error: recordResult.error
      });
    }
  }

  get isReadyToOpenSubTab() {
    return !!(this.isConsoleNavigation && this.tabId && this.relatedRecordId);
  }

  renderedCallback() {
    log({
      msg: "voiceCallOpenRelatedRecordAsSubTab: renderedCallback triggered.",
      isReadyToOpenSubTab: this.isReadyToOpenSubTab
    });
    if (this.isReadyToOpenSubTab) {
      this.openRelatedRecord();
    }
  }

  // Method to open related record as a subtab
  async openRelatedRecord() {
    log({
      msg: "voiceCallOpenRelatedRecordAsSubTab: openRelatedRecord triggered.",
      isConsoleNavigation: this.isConsoleNavigation,
      tabId: this.tabId,
      relatedRecordId: this.relatedRecordId
    });
    try {
      // Retrieve tab information
      const tabInfo = await getTabInfo(this.tabId);
      if (!tabInfo) {
        log({
          msg: "voiceCallOpenRelatedRecordAsSubTab: Tab info is undefined for tabId:",
          tabId: this.tabId
        });
        return;
      }
      const { isSubtab, parentTabId, tabId, subtabs } = tabInfo;
      const primaryTabId = isSubtab ? parentTabId : tabId;
      if (!primaryTabId) {
        log({
          msg: "voiceCallOpenRelatedRecordAsSubTab: Could not determine primary tabId. Skipping subtab open.",
          tabId: this.tabId,
          isSubtab: isSubtab,
          parentTabId: parentTabId
        });
        return;
      }
      log({
        msg: "voiceCallOpenRelatedRecordAsSubTab: Primary tabId determined.",
        primaryTabId: primaryTabId
      });

      // Check if the related record is already open in a subtab
      if (
        subtabs &&
        subtabs.some((tab) => tab.recordId === this.relatedRecordId)
      ) {
        log({
          msg: "voiceCallOpenRelatedRecordAsSubTab: Related record already open as subtab. Skipping.",
          relatedRecordId: this.relatedRecordId
        });
        return;
      }

      // Open the related record as a subtab in the primary tab
      log({
        msg: "voiceCallOpenRelatedRecordAsSubTab: Opening related record as subtab.",
        primaryTabId: primaryTabId,
        relatedRecordId: this.relatedRecordId
      });
      await openSubtab(primaryTabId, {
        recordId: this.relatedRecordId,
        focus: true
      });
      log({
        msg: "voiceCallOpenRelatedRecordAsSubTab: Successfully opened related record as subtab.",
        primaryTabId: primaryTabId,
        relatedRecordId: this.relatedRecordId
      });
    } catch (err) {
      log({
        msg: "voiceCallOpenRelatedRecordAsSubTab: Error opening related record as subtab.",
        error: err
      });
    }
  }
}
