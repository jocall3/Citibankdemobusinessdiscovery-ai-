
import React from 'react';

export const CTDB_URL = "citibankdemobusiness.dev";
export const CTDB_NAME = "Citibank Demo Business Inc";

export enum OnboardingAnswerKey {
  CreditCardProcessing = "creditCardProcessing",
  ECommercePlatform = "eCommercePlatform",
  PaymentGateway = "paymentGateway",
  CloudProvider = "cloudProvider",
  AIPlatform = "aiPlatform",
  CRMSystem = "crmSystem",
  HRMSystem = "hrmSystem",
  CyberSecurity = "cyberSecuritySolution",
  ProjectManagement = "projectManagement",
  Blockchain = "blockchainService"
}

export const AS_OP_MP: Record<string, { l: string; v: string }[]> = {
  [OnboardingAnswerKey.CreditCardProcessing]: [
    { l: "Stp", v: "Stripe" },
    { l: "Ppl", v: "PayPal" },
    { l: "Adn", v: "Adyen" }
  ],
  [OnboardingAnswerKey.ECommercePlatform]: [
    { l: "Shpfy", v: "Shopify" },
    { l: "WoCmm", v: "WooCommerce" },
    { l: "SqSp", v: "SquareSpace" }
  ],
  [OnboardingAnswerKey.PaymentGateway]: [
    { l: "Pld", v: "Plaid" },
    { l: "Stp", v: "Stripe" },
    { l: "Mrqt", v: "Marqeta" }
  ],
  [OnboardingAnswerKey.CloudProvider]: [
    { l: "Azr", v: "Azure" },
    { l: "GgCld", v: "GoogleCloud" },
    { l: "AWS", v: "AWS" }
  ],
  [OnboardingAnswerKey.AIPlatform]: [
    { l: "Gmn", v: "Gemini" },
    { l: "ChGt", v: "ChatGPT" },
    { l: "HgFs", v: "HuggingFace" }
  ],
  [OnboardingAnswerKey.CRMSystem]: [
    { l: "SlFrc", v: "Salesforce" },
    { l: "HbSp", v: "HubSpot" },
    { l: "Zoho", v: "ZohoCRM" }
  ],
  [OnboardingAnswerKey.HRMSystem]: [
    { l: "Wkd", v: "Workday" },
    { l: "Adp", v: "ADP" },
    { l: "Gst", v: "Gusto" }
  ],
  [OnboardingAnswerKey.CyberSecurity]: [
    { l: "PltNw", v: "PaloAltoNetworks" },
    { l: "Frtnt", v: "Fortinet" },
    { l: "CrStk", v: "CrowdStrike" }
  ],
  [OnboardingAnswerKey.ProjectManagement]: [
    { l: "Jra", v: "Jira" },
    { l: "Asn", v: "Asana" },
    { l: "Tlo", v: "Trello" }
  ],
  [OnboardingAnswerKey.Blockchain]: [
    { l: "Ethrm", v: "Ethereum" },
    { l: "HyLg", v: "Hyperledger" },
    { l: "Crdo", v: "Cardano" }
  ]
};

export const CITI_LOGO = (
  <svg width="100" height="30" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 5C10 5 5 10 5 15C5 20 10 25 15 25H85C90 25 95 20 95 15C95 10 90 5 85 5H15Z" fill="#003B70"/>
    <path d="M50 2C40 2 30 10 30 15C30 20 40 28 50 28C60 28 70 20 70 15C70 10 60 2 50 2Z" fill="#E1211C"/>
    <text x="35" y="20" fill="white" font-family="Arial" font-size="12" font-weight="bold">CITI</text>
  </svg>
);
