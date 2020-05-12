function pageSpeedApiEndpointUrl(strategy) {
  const websiteHomepageUrl = 'YOUR_WEBSITE_URL';
  const apiBaseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  const apikey = 'YOUR_GOOGLE_PAGE_SPEED_INSIGHTS_API_KEY';
  
  const apiEndpointUrl = apiBaseUrl + '?url=' + websiteHomepageUrl + '&key=' + apikey + '&strategy=' + strategy;
  
  return apiEndpointUrl;
}

function composeMessageForSlack() {
  const mobileData = fetchDataFromPSI('mobile');
  const desktopData = fetchDataFromPSI('desktop');
  
  const message = {
    'blocks': [
     {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': '*Website performance on Prod:*'
       }
     }
    ],
     'attachments': [
      {
        'blocks': [
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': 'Performance on Mobile ->'
             }
          },
          {
          'type': 'section',
          'text': {
              'type': 'mrkdwn',
              'text': 'Score = ' + mobileData['score'] + 
                      '\n\nFirst Contentful Paint = ' + mobileData['firstContentfulPaint'] + 
                      '\n\nSpeed Index = ' + mobileData['speedIndex'] + 
                      '\n\nTime To Interactive = ' + mobileData['timeToInteractive'] +
                      '\n\nFirst Meaningful Paint = ' + mobileData['firstMeaningfulPaint'] + '\n\n'
          }
        },
        {
          'type': 'divider'
        },
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': 'Performance on Desktop ->'
           }
         },
         {
          'type': 'section',
          'text': {
              'type': 'mrkdwn',
              'text': 'Score = ' + desktopData['score'] + 
                      '\n\nFirst Contentful Paint = ' + desktopData['firstContentfulPaint'] + 
                      '\n\nSpeed Index = ' + desktopData['speedIndex'] + 
                      '\n\nTime To Interactive = ' + desktopData['timeToInteractive'] +
                      '\n\nFirst Meaningful Paint = ' + desktopData['firstMeaningfulPaint'] + '\n\n'
          }
         }
       ]
      }
     ]
  };
  
  return message;
}

function fetchDataFromPSI(strategy) {
  const pageSpeedEndpointUrl = pageSpeedApiEndpointUrl(strategy);
  const response = UrlFetchApp.fetch(pageSpeedEndpointUrl);
  const json = response.getContentText();
  const parsedJson = JSON.parse(json);
  
  const lighthouse = parsedJson['lighthouseResult']
  
  const result = {
    'score': lighthouse['categories']['performance']['score']*100,
    'firstContentfulPaint': lighthouse['audits']['first-contentful-paint']['displayValue'],
    'speedIndex': lighthouse['audits']['speed-index']['displayValue'],
    'timeToInteractive': lighthouse['audits']['interactive']['displayValue'],
    'firstMeaningfulPaint': lighthouse['audits']['first-meaningful-paint']['displayValue'],
    'firstCpuIdle': lighthouse['audits']['first-cpu-idle']['displayValue'],
    'estimatedInputLatency': lighthouse['audits']['estimated-input-latency']['displayValue'],
  }

  return result;
}

function postDataToSlack() {
  const slackWebhookUrl = 'YOUR_SLACK_WEBHOOK_URL';

  const payload = composeMessageForSlack();
  
  const options = {
    'method' : 'post',
    'contentType' : 'application/json',
    'payload' : JSON.stringify(payload)
  };
  
  return UrlFetchApp.fetch(slackWebhookUrl, options);
}

function doGet() {
  return ContentService.createTextOutput('Website Performance retrieval successfull!');
}
