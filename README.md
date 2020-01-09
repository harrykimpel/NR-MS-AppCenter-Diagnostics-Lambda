# New Relic Microsoft App Center Diagnostics Lambda integration

This AWS Lambda function collects diagnostics information from Microsoft App Center platform and sends them via custom events to New Relic Insights.

## index.js
This file contains the AWS Lambda implementation.

## dashboard.json
This file contains the JSON representation of an Insights dashboard. Please refer to the New Relic Dashboard API (see https://rpm.newrelic.com/api/explore/dashboards/create) in order to create this dashboard in your account.

## Environment Variables

* **msAppCenterOwnerName**: the owner name of the Microsoft App Center account
* **msAppCenterAppName**: the name of the Microsoft App Center application
* **msAppCenterAPIToken**: the API token of the Microsoft App Center account
* **nrAccountId**: the account ID of the New Relic account
* **nrInsightsAPIKey**: the New Relic Insights Insert API key of the New Relic account
