# New Relic Microsoft App Center Diagnostics Lambda integration

This AWS Lambda function collects diagnostics information from Microsoft App Center platform and sends them via custom events to New Relic Insights.

## Environment Variables

* **msAppCenterOwnerName**: the owner name of the Microsoft App Center account
* **msAppCenterAppName**: the name of the Microsoft App Center application
* **msAppCenterAPIToken**: the API token of the Microsoft App Center account
* **nrAccountId**: the account ID of the New Relic account
* **nrInsightsAPIKey**: the New Relic Insights Insert API key of the New Relic account
