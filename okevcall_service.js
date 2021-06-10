import axios from 'axios';
import moment from 'moment';
import { message } from 'antd';
export const server = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setServer = data => {
  server.defaults.baseURL = data.api_base_url;
  server.defaults.timeout = 1000 * 60;
  server.defaults.headers[data.api_key_field] = data.api_key;
  server.defaults.headers.Authorization = data.api_token || '';
};

export function calculateRangeTimes(started_at, ammount) {
  try {
    const sa = started_at;
    let start_at;
    if (sa && sa !== 'null' && sa !== '') {
      const s = moment(sa);
      if (s.isValid()) {
        s.add(ammount, 'minutes');
        start_at = s.diff(moment(), 'seconds');
      } else {
        start_at = 0;
      }
      return parseFloat(start_at < 0 ? 0 : start_at);
    }
  } catch (e) {
    console.error('onProsesVcall', e);
    return 0;
  }
}

export function addStreamInDiv(stream, divId, mediaEltId, style, muted) {
  var streamIsVideo = stream.hasVideo();

  var mediaElt = null,
    divElement = null,
    funcFixIoS = null,
    promise = null;

  if (streamIsVideo === 'false') {
    mediaElt = document.createElement('audio');
  } else {
    mediaElt = document.createElement('video');
  }

  mediaElt.id = mediaEltId;
  mediaElt.autoplay = true;
  mediaElt.muted = muted;
  mediaElt.style.width = style.width;
  mediaElt.style.height = style.height;

  funcFixIoS = function() {
    var promise = mediaElt.play();

    console.log('funcFixIoS');
    if (promise !== undefined) {
      promise
        .then(function() {
          // Autoplay started!
          console.log('Autoplay started');
          console.error('Audio is now activated');
          document.removeEventListener('touchstart', funcFixIoS);

          // $('#status')
          //   .empty()
          //   .append('iOS / Safari : Audio is now activated');
        })
        .catch(function(error) {
          // Autoplay was prevented.
          console.error('Autoplay was prevented');
        });
    }
  };

  stream.attachToElement(mediaElt);

  divElement = document.getElementById(divId);
  divElement.appendChild(mediaElt);
  promise = mediaElt.play();

  if (promise !== undefined) {
    promise
      .then(function() {
        // Autoplay started!
        console.log('Autoplay started');
      })
      .catch(function(error) {
        // Autoplay was prevented.
        if (apiRTC.osName === 'iOS') {
          console.info(
            'iOS : Autoplay was prevented, activating touch event to start media play'
          );
          //Show a UI element to let the user manually start playback

          //In our sample, we display a modal to inform user and use touchstart event to launch "play()"
          document.addEventListener('touchstart', funcFixIoS);
          console.error(
            'WARNING : Audio autoplay was prevented by iOS, touch screen to activate audio'
          );
          // $('#status')
          //   .empty()
          //   .append(
          //     'WARNING : iOS / Safari : Audio autoplay was prevented by iOS, touch screen to activate audio'
          //   );
        } else {
          console.error('Autoplay was prevented');
        }
      });
  }
}

export const updateFirebaseNotification = async (type, user_id, data) => {
  try {
    const url =
      'user/' +
      (type === 'doctors' ? 'doctors' : 'patients') +
      '/' +
      user_id +
      '/notifications/firebase/send';
    await server.post(url, data);
  } catch (e) {
    console.log('failed_update_fb_notification', e);
  }
};

export const initApiRtc = () =>
  new Promise((resolve, reject) => {
    if (!document.getElementById('api-rtc-js')) {
      const script = document.createElement('script');
      script.id = 'api-rtc-js';
      script.src = 'https://cloud.apizee.com/apiRTC/apiRTC-latest.min.js';
      script.onload = () => {
        message.success('apirtc loaded');
        resolve('success');
      };
      script.onerror = () => {
        const apirtcjs = document.getElementById('api-rtc-js');
        if (apirtcjs) {
          apirtcjs.remove();
        }
        message.error('server vcall sedang ada masalah, silahkan coba lagi');
        reject(new Error('failed to load vcall server'));
      };
      document.body.appendChild(script);
    } else {
      message.warning('apiRTC already loaded');
      resolve('success');
    }
  });

export const setOrderResponse = async (order_id, order_code, action) => {
  const url = 'order/' + order_id + '/response';
  const payload = { order_code, action };
  return await server.patch(url, payload);
};

export const getOrdersData = async (
  order_id,
  order_code,
  service_name,
  detail = false
) => {
  const url = 'order/' + order_id + '/data/' + service_name;
  return await server.get(url, {
    params: {
      code: order_code,
      detail
    }
  });
};

export const getMedicalRecord = async orderId => {
  const url = 'order/' + orderId + '/medicalrecords';
  return await server.get(url);
};

export const codeServiceName = code => {
  const c = code.substr(0, 3);
  let r;
  if (c === 'OKC') {
    r = 'Okechat';
  } else if (c === 'OKD') {
    r = 'Okedok';
  } else if (c === 'OKV') {
    r = 'Okedok';
  }
};
