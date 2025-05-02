const MAILERLITE_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiYTQ5NzBiY2Y3MTI1OTNhNzE1NjAxMDUzYWM3NDUzZTIzZmEwZTY0NTgyMDE1Nzg0YWFjMGI0ZWEzYzIzOWEyZTM5YWY2MWU5OTVhYTcwNzUiLCJpYXQiOjE3NDU4NDgwMzYuOTc3MDE2LCJuYmYiOjE3NDU4NDgwMzYuOTc3MDIsImV4cCI6NDkwMTUyMTYzNi45NjkyODksInN1YiI6IjE0OTY5MzciLCJzY29wZXMiOltdfQ.N9Wk5ph7Q6AilinPZaXftFKuY4fwzZ81AcYLqtmJX1tyCaF1CKPd-Hc2HzYCbGaSowlKqXjH6jmh_9K6TjuaXedNmJ8mE7MAy17oCRI14sbaACYn2roTHPltXF6SnfgjVN6o5SO6xugAAlhkA6x-REokYzx8gE8wOJKHBjdirzwuAYtNj3s4sR9iTq5FSiAIbLUCKDiz5LQIAfFzc48xuTr6XBmKx0iMjIEd5kWQYeVFuZjYjwvzEbDBHTVpMPzR1nuZeyFp_EIsR6RsLIog53evtSOv6QF-RF8ESDiRBXrhHOgNt242r2vB1qy0VYQ5V9AQs1jtIYSDAUczS6d3LEYAuavAzt7vFs5bJhSPORi3zOSYr71Hq68uok9IiTj8n72sFM2KUOc2QJjb3x-wyh3Hw3gjrJB2DjODeJYHm3uPTZwBS3R1m9ipzXF9tWaiPrL8B8pU9t31s9WBf7f9o2ELHJalytpGSgCKQtkEMmWJpklIoBMKj6rRZCv5DKsvHYPqUOzf1bLDyemkkB55GmoMpF5hfYB5itqYVJvleSx-05gm5259PkaSSPkVwVt6hu6aK5r5gen-udGekoizZ-wp605UIj_vegkoHUHMfR7amjhCjcGlMZqm2iOVf-QmXQ4hNU0djZUP_Ea0jbYpJIBFZLL-34aRWNY_26DzzAc';

export async function addSubscriberToMailerlite(email, name = '') {
  try {
    // First check if subscriber already exists
    const checkResponse = await fetch(`https://connect.mailerlite.com/api/subscribers/${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    let subscriber;
    if (checkResponse.status === 404) {
      // Subscriber doesn't exist, create new
      const createResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${MAILERLITE_API_TOKEN}`
        },
        body: JSON.stringify({
          email: email,
          fields: {
            name: name || email.split('@')[0]
          },
          groups: ['89127161808615425'], // Your ScriptSea users group ID
          status: 'active'
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        console.error('MailerLite API error:', error);
        return false;
      }

      subscriber = await createResponse.json();
    } else if (checkResponse.ok) {
      // Subscriber exists, update their info
      const updateResponse = await fetch(`https://connect.mailerlite.com/api/subscribers/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${MAILERLITE_API_TOKEN}`
        },
        body: JSON.stringify({
          fields: {
            name: name || email.split('@')[0]
          },
          groups: ['89127161808615425'], // Your ScriptSea users group ID
          status: 'active'
        })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        console.error('MailerLite API error:', error);
        return false;
      }

      subscriber = await updateResponse.json();
    }

    return true;
  } catch (error) {
    console.error('Error adding/updating subscriber to MailerLite:', error);
    return false;
  }
} 