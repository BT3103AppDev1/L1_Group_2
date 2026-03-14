// src/services/analytics.js

// 1. Calculate monthly overview
export function getMonthlyTotal(subscriptions) {
  return subscriptions.reduce((total, sub) => {
    const monthlyCost = sub.billingCycle === 'yearly' ? (sub.cost / 12) : sub.cost;
    return total + monthlyCost;
  }, 0);
}

// 2. Calculate the yearly overview
export function getYearlyTotal(subscriptions) {
  return subscriptions.reduce((total, sub) => {
    const yearlyCost = sub.billingCycle === 'monthly' ? (sub.cost * 12) : sub.cost;
    return total + yearlyCost;
  }, 0);
}

// 3. Active Alerts section
export function getUpcomingRenewals(subscriptions, daysWarning = 7) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysWarning);

  return subscriptions.filter(sub => {
    // convert timestamp to JS Dates
    const billingDate = sub.nextBillingDate.toDate(); 
    return billingDate >= today && billingDate <= futureDate;
  });

  // 4. Generate the 6-month trend data for Chart.js
export function getSixMonthTrend(subscriptions) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels = [];
  const data = [];

  const today = new Date();
  let currentMonth = today.getMonth(); 
  let currentYear = today.getFullYear();

  // Loop backwards to build the last 6 months
  for (let i = 5; i >= 0; i--) {
    let targetDate = new Date(currentYear, currentMonth - i, 1);
    labels.push(monthNames[targetDate.getMonth()]);

    let monthlyTotal = 0;

    subscriptions.forEach(sub => {
      // Convert Firestore timestamp to a standard JS Date
      const createdAt = sub.createdAt?.toDate() || new Date();
      
      const endOfTargetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      if (createdAt <= endOfTargetMonth) {
         if (sub.billingCycle === 'monthly') {
           monthlyTotal += sub.cost;
         } else if (sub.billingCycle === 'yearly') {
           monthlyTotal += (sub.cost / 12); 
         }
      }
    });
    data.push(Number(monthlyTotal.toFixed(2))); 
  }

  return { labels, data }; 
}



}