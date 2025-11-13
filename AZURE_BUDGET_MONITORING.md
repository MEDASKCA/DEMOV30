# Azure Budget Monitoring & Alerts Guide

This guide will help you monitor your Azure credits and set up alerts before they run out.

## Current Situation
- **Credits**: £200/$200
- **Expiry**: 6 days
- **Auto-stop**: Yes, services stop when credits run out (no surprise charges)

## Step 1: Set Up Budget Alerts

### Create a Budget Alert (HIGHLY RECOMMENDED)

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **"Cost Management + Billing"**
3. Click **"Cost Management"** in the left menu
4. Click **"Budgets"**
5. Click **"+ Add"**
6. Configure your budget:

   **Budget Details:**
   - Name: `TOM AI Daily Budget`
   - Reset period: `Monthly`
   - Creation date: Today
   - Expiration date: End of your free trial
   - Amount: `£30` or `$40` (adjust based on your needs)

   **Alert Conditions:**
   Create 3 alerts:

   **Alert 1 - Warning at 50%**
   - Alert condition: `Actual`
   - % of budget: `50`
   - Email: Your email address
   - Language: English

   **Alert 2 - Critical at 80%**
   - Alert condition: `Actual`
   - % of budget: `80`
   - Email: Your email address

   **Alert 3 - Maximum at 100%**
   - Alert condition: `Actual`
   - % of budget: `100`
   - Email: Your email address

7. Click **"Create"**

## Step 2: Monitor Credit Usage in Real-Time

### Check Remaining Credits

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Subscriptions"**
3. Click your subscription name
4. You'll see:
   - **Credit remaining**: e.g., £200.00
   - **Credit used**: e.g., £0.00
   - **Days remaining**: e.g., 6 days

### Daily Cost Analysis

1. Go to **"Cost Management + Billing"**
2. Click **"Cost analysis"**
3. View your daily spending:
   - Today's cost
   - This week's cost
   - Breakdown by service (Azure OpenAI, Azure TTS, etc.)

## Step 3: Set Up Spending Limits

### Method 1: Subscription Spending Limit
1. Go to **"Subscriptions"**
2. Click your subscription
3. Click **"Payment methods"** in left menu
4. Enable spending limit (prevents charges after credits run out)

### Method 2: Azure OpenAI Resource Limit
1. Go to your Azure OpenAI resource
2. Click **"Quotas"** in left menu
3. Set per-minute token limits to control usage

## Expected Usage & Costs

### TOM AI Usage Estimates

**With £200 credits over 6 days:**

| Service | Usage | Cost per Unit | Daily Cost | 6-Day Total |
|---------|-------|---------------|------------|-------------|
| GPT-4 Chat | 100 queries/day | ~£0.05/query | £5 | £30 |
| GPT-4 Streaming | Included | - | - | - |
| Azure TTS | 50 responses/day | ~£0.01/response | £0.50 | £3 |
| **TOTAL** | - | - | **£5.50/day** | **£33** |

**Result**: You'll use ~£33 of your £200 credits in 6 days. **£167 will be wasted** when they expire!

### Maximize Your Credits

To use more of your £200 before expiry:

1. **Test heavily** - Ask TOM AI lots of questions
2. **Get staff to try it** - Multiple users testing
3. **Try different scenarios** - Schedule queries, staff lookups, analytics
4. **Voice testing** - Every response has realistic voice
5. **Load testing** - See how it handles peak usage

**Even with heavy use, you probably won't exceed £100 in 6 days.**

## What Happens When Credits Run Out?

### Automatic Actions
1. **Azure OpenAI API calls fail immediately**
2. **TOM AI automatically falls back** to free rule-based system
3. **Voice falls back** to browser speech synthesis
4. **No charges** unless you add a payment method

### You'll See
```
Console: "Azure OpenAI not available, using fallback rule-based system"
Console: "Azure TTS not available, using browser fallback"
```

### Your Data
- **Firebase data**: Unaffected (separate service)
- **Application**: Still works with fallback system
- **No data loss**: Everything remains intact

## Monitoring Dashboard

### Daily Check (30 seconds)
1. Go to [Azure Portal](https://portal.azure.com)
2. Check your subscription **Credit remaining**
3. Review **Cost analysis** for today

### Check These Metrics
- **Credits used today**: Should be £3-10/day
- **Credits remaining**: Monitor the countdown
- **Days remaining**: Count down to expiry
- **Top services**: Ensure only expected services are running

## Alert Email Example

You'll receive emails like this:

```
Subject: Azure Budget Alert - 50% threshold exceeded

Your budget "TOM AI Daily Budget" has exceeded 50% of the allocated amount.

Current spend: £15.00
Budget amount: £30.00
Threshold: 50%

View details in Cost Management.
```

**Action**: Review usage, check if expected.

## Cost Optimization Tips

### Reduce Costs (if needed)

1. **Limit queries during testing**
   - Only test critical features
   - Batch your questions

2. **Disable voice temporarily**
   - Edit `TomAIChatPanel.tsx`
   - Comment out the voice call
   - Saves TTS costs

3. **Use non-streaming endpoint**
   - Slightly cheaper
   - Edit code to skip `/api/chat/stream`

4. **Set lower token limits**
   - In `azureOpenAIService.ts`
   - Reduce `max_tokens: 1500` to `max_tokens: 500`

### Increase Usage (maximize credits before expiry)

1. **Run comprehensive tests**
2. **Generate test data queries**
3. **Stress test the system**
4. **Create documentation with examples**
5. **Train staff on the system**

## Troubleshooting

### I'm not getting budget alerts
- Check email spam folder
- Verify email address in budget settings
- Ensure alerts are enabled for your subscription

### Credits depleted faster than expected
- Check **Cost analysis** > **Group by: Service**
- Look for unexpected services running
- Verify only Azure OpenAI is being used
- Check for multiple deployments

### Can't see credit remaining
- May need to wait a few hours after account creation
- Try refreshing the Subscriptions page
- Check you're viewing the correct subscription

### Services stopped but credits remain
- Check if deployments are running
- Verify API keys are correct in `.env.local`
- Review service health in Azure Portal

## Summary Checklist

Before you start using TOM AI with Azure credits:

- [ ] Set up budget alerts (50%, 80%, 100%)
- [ ] Enable spending limits on subscription
- [ ] Bookmark Cost Management dashboard
- [ ] Test that email alerts work
- [ ] Understand fallback behavior
- [ ] Know where to check credit balance
- [ ] Have plan for after credits expire

## After Credits Expire

You have three options:

1. **Continue with free system**
   - Rule-based responses
   - Browser voice
   - No cost

2. **Add payment method**
   - Pay-as-you-go
   - ~£30-50/month
   - Set strict budget limits

3. **Pause Azure services**
   - Delete deployments
   - Keep free system
   - Re-enable later if needed

Your choice! The system works great either way.
