import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import { Button, Layout, message, Modal, Statistic, Skeleton } from 'antd';
import { CloseOutlined, PhoneFilled, DiffOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  server,
  setServer,
  calculateRangeTimes,
  addStreamInDiv,
  updateFirebaseNotification,
  initApiRtc,
  setOrderResponse,
  getOrdersData,
  getMedicalRecord
} from './okevcall_service';

const { Countdown } = Statistic;
var opponentId = null;
var connectedSession = null;
var currentCall = null;
var localStream = null;
var remoteStream = null;
var action = null;
console.log('server', server);
//Function to calculate countdown

//Function to add media stream in Div

function VcallPartner() {
  const [status, setStatus] = useState('calling');
  const [isLocalStreamAvailable, setIsLocalStreamAvailable] = useState(false);
  const [isRemoteStreamAvailable, setIsRemoteStreamAvailable] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);
  const [listMedical, setListMedical] = useState([]);
  const [loadingMedical, setLoadingMedical] = useState(false);

  const [data, setData] = useState({
    order_id: '42',
    order_code: 'OKV202106070001',
    queue_id: '1',
    queue_service_id: '2',
    queue_list_id: '7',
    doctor_id: '5',
    patient_id_parent: '8',
    patient_id: '8',
    patient_name: 'Adit Member',
    patient_age: '0',
    patient_birth_date: '2021-06-07',
    patient_gender: 'male',
    order_number: '1',
    skipped: '1',
    complaint: 'okevcall test',
    status: 'paid',
    order_date: '2021-06-07T07:02:26.227Z',
    service_name: 'okevcall',
    order_service_id: '42',
    service_id: '2',
    address: '----------',
    address_note: '-',
    location: 'null',
    start_at: 'null',
    end_at: 'null',
    token_midtrans: 'null',
    user_name: 'Adit Member',
    patient_phone: '081298249207',
    doctor_name: 'Dr raditsan ',
    doctor_type: 'umum',
    admin_fee: '10000',
    share_fee: '2000',
    service_fee: '8000',
    appointment_date: '2021-06-07T14:02:25.000Z',
    medical_record: 'false',
    medical_record_url:
      'https://stage-api.okedok.co.id/v2/order/42/medicalrecords',
    api_base_url: 'https://stage-api.okedok.co.id/v2/',
    api_key_field: 'apiKey',
    api_key: 'C2kmG6LOUZyJF6ZK3EitJMA5EKFlNJQI',
    api_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRHIgcmFkaXRzYW4gIiwiZG9jdG9yX2lkIjo1LCJwaWN0dXJlX3VybCI6Im51bGwiLCJlbWFpbCI6InJhZGl0c2FkaXR5YTJAZ21haWwuY29tIiwicGhvbmUiOiIwODEyOTgyNDkyMDciLCJzdGF0dXMiOiJhY3RpdmUiLCJ0eXBlIjoiZG9jdG9yIiwiZmNtX3Rva2VuIjoiY0VOZFRDVE5HMEZBZ1MtdEUya0N4VTpBUEE5MWJFX2VSQVhCZ2otTFBhdjFJOVlIVnZtMHJpeGs2V3F5NGJLR1FvQmpXZHIwdlZSQjNWVW41M28xNGdic2YzMDd1bldBRVVqS2F1dUFKamNpNVVQV1JFQVpKWnhhZGQwT0JvZTd0aENmNTRkT3BCdVFqZTB6bE5TalctUUNTNS13NVQzZjJNRSIsImRldmljZSI6IndlYiIsImRldmljZV9pbmZvIjoiTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTAuMTU7IHJ2Ojg5LjApIEdlY2tvLzIwMTAwMTAxIEZpcmVmb3gvODkuMCIsImRvY3Rvcl90eXBlIjoidW11bSIsInJlZ2lzdHJhdGlvbl9udW1iZXIiOiI4MjUwNjIiLCJyZWdpc3RyYXRpb25fY29kZSI6IlJFRzIwMjEwNjA0OTIwNyIsInJlZ2lzdHJhdGlvbl9pbnRlcnZpZXdfZGF0ZSI6IjIwMjEtMDYtMDdUMDY6NDA6NDUuNDQzWiIsInJlZ2lzdHJhdGlvbl9zdGF0dXMiOiJhY2NlcHRlZCIsInJlZ2lzdHJhdGlvbl9leHBpcmUiOiIyMDIxLTA2LTExVDA2OjQwOjQ1LjQ0M1oiLCJpYXQiOjE2MjMwNDY0MDV9.YMKPIivHPsUQ2_eYCa9-xO0cnYVVXFw9L_c64XOV944',
    apzKey: '784f886e00021c60cad7e263f2177416'
  });

  const dataFix = {
    ...data,
    api_base_url: undefined,
    api_token: undefined,
    api_key: undefined,
    api_key_field: undefined,
    apzKey: undefined,
    medical_record_url: undefined
  };

  const getOrderVcall = async () => {
    console.log('getOrderVcall');
    setServer(data);
    try {
      await getOrdersData(data.order_id, data.order_code, 'okevcall', false);
    } catch (e) {
      console.error('getOrderVcall', e);
    }
  };

  useEffect(() => {
    initApiRtc().then(() => {
      initVcall();
    });
  }, []);

  const getMR = async () => {
    setLoadingMedical(true);
    try {
      const {
        data: { data: listMedical = [] }
      } = await getMedicalRecord(data.order_id);
      setListMedical(listMedical);
      setLoadingMedical(false);
      console.log('data', listMedical);
    } catch (e) {
      setLoadingMedical(false);
      console.error('getMR', e);
    }
  };

  const onClickCancel = () => {
    sendMessageToNative({ process: 'cancel' });
  };

  const onClickHangup = () => {
    Modal.confirm({
      title: 'Okedok',
      content:
        'Waktu panggilan belum selesai, apakah anda yakin ingin mengakhiri panggilan?',
      okText: 'Ya',
      onOk: () => {
        onEndCall('endcall');
      },
      cancelText: 'Tidak'
    });
  };

  const onClickMedicalRecord = () => {
    setIsModalVisible(true);
    getMR();
  };

  const initVcall = () => {
    setServer(data);
    opponentId =
      'member' + data.patient_id_parent + data.order_id + data.order_code;
    registerApiRtc({
      // id: "my_id" + "123454321",
      // id: "partner" + (order.doctor_id || order.partner_id) + order.order_code,
      id:
        'partner' +
        (data.doctor_id || data.partner_id) +
        data.order_id +
        data.order_code,
      cloudUrl: 'https://cloud.apizee.com'
    });
  };

  const sendNotification = async () => {
    console.log('prepare sendNotification');

    const payload = {
      title: 'Okevcall',
      body:
        'Dokter telah siap, silahkan menghubungi dokter dalam waktu 2 menit, Terima Kasih.',
      data: JSON.stringify({
        ...dataFix,
        process: 'doctor_call'
      }),
      sound: 'default',
      content_available: 'true'
    };
    const url = 'user/patients/' + data.doctor_id + '/notifications/send';

    try {
      await server.post(url, payload);
      console.log('success_send_notification');
    } catch (e) {
      console.log('failed_send_notification', e);
    }

    updateDbDoctor(data.order_number);
    updateDbPatient('ringing');
  };

  const updateDbDoctor = async active_order_number => {
    await updateFirebaseNotification('doctors', data.doctor_id, {
      active_order_number
    });
  };
  const updateDbPatient = async status_vcall => {
    await updateFirebaseNotification('patients', data.patient_id_parent, {
      ...dataFix,
      status_vcall
    });
  };

  const getDetailAndCall = async call => {
    setShowWaiting(false);
    try {
      let orderData;
      const params = data;
      if (params.start_at === 'null') {
        await setOrderResponse(params.order_id, params.order_code, 'started');
        const {
          data: { data: dataO }
        } = await getOrdersData(
          params.order_id,
          params.order_code,
          'okevcall',
          false
        );
        console.log('dataO', dataO);
        orderData = dataO;
      } else {
        orderData = params;
      }
      const rangeTime = calculateRangeTimes(orderData.start_at, 30);
      console.log('rangeTime', rangeTime);
      setData({
        ...params,
        ...orderData,
        rangeTime
      });
      if (rangeTime === 0) {
        sendMessageToNative({ process: 'timesup' });
        return;
      }

      console.log('params', params);
      currentCall = call;
      setCallListeners();
    } catch (e) {
      console.error('getDetailAndCall', e);
      // setTimeout(async () => {
      //   await getDetailAndCall(call);
      // }, 2000);
    }
  };

  const setCallListeners = () => {
    setStatus('connected');
    currentCall
      .on('localStreamAvailable', stream => {
        console.log('localStreamAvailable', stream);
        localStream = stream;
        setIsLocalStreamAvailable(true);

        if (localStream) {
          stream.addInDiv(
            'local-stream',
            'local-media',
            { height: '100%' },
            true
          );
        }
        console.log('localStreamAvailable');
      })
      .on('streamAdded', stream => {
        console.log('streamAdded :', stream);
        remoteStream = stream;
        setIsRemoteStreamAvailable(true);

        if (remoteStream) {
          stream.addInDiv(
            'remote-stream',
            'remote-media',
            { height: '100%' },
            false
          );
        }
      })
      .on('streamRemoved', stream => {
        console.log('streamStreamRemoved');
        stream.removeFromDiv('remote-stream', 'remote-media');
        remoteStream = null;
      })
      .on('userMediaError', e => {
        console.error('userMediaError detected : ', JSON.stringify(e));
        console.error('userMediaError detected with error : ', e.error);
        sendMessageToNative({ process: 'permission_denied' });
      })
      .on('hangup', () => {
        // this.onStopCall();
        if (!['endcall', 'timesup'].includes(action)) {
          onEndCall('hangup');
        }
      });
  };

  const leaveGroup = () => {
    console.log('leaveGroup');
    if (connectedSession) {
      try {
        connectedSession.leaveGroup('default');
      } catch (e) {}
    }
    updateDbDoctor('-');
    updateDbPatient('-');
  };

  const finishWaitingCountDown = () => {
    sendMessageToNative({ process: 'skip' });
  };

  const onEndCall = (actionStr = 'action') => {
    console.log('action', actionStr);
    updateDbPatient(actionStr);
    if (actionStr === 'cancel') {
      leaveGroup();
      onClickCancel();
      return;
    }
    action = actionStr;
    clearStreams();
    // this.setStatus(4);
    if (actionStr === 'hangup') {
      sendMessageToNative({ process: 'hangup' });
    } else if (actionStr === 'timesup') {
      sendMessageToNative({ process: 'timesup' });
    } else if (actionStr !== 'reject') {
      sendMessageToNative({ process: 'reject' });
    } else {
      onClickCancel();
    }
  };

  const clearStreams = () => {
    if (currentCall) {
      currentCall.hangUp();
    }
    if (localStream) {
      localStream.removeFromDiv('local-stream', 'local-media');
    }
    if (remoteStream) {
      remoteStream.removeFromDiv('remote-stream', 'remote-media');
    }
    setIsLocalStreamAvailable(false);
    setIsRemoteStreamAvailable(false);
    localStream = null;
    remoteStream = null;
    currentCall = null;
    // this.apiService.deleteVcallData()
    updateDbDoctor(null);
  };

  const sendMessageToNative = objData => {
    var messageObj = objData;
    var stringifiedMessageObj = JSON.stringify({
      ...messageObj,
      callData: data
    });
    message.info(objData.process);
    try {
      webkit.messageHandlers.cordova_iab.postMessage(stringifiedMessageObj);
    } catch (e) {
      console.log(e);
    }
  };

  function registerApiRtc(registerInformation) {
    // apiRTC.setLogLevel(10);
    var ua = new apiRTC.UserAgent({
      uri: 'apzkey:' + data.apzKey
      // uri: "apzkey:myDemoApiKey"
    });
    ua.register(registerInformation)
      .then(session => {
        setShowWaiting(true);
        setStatus('ringing');
        // Save session
        connectedSession = session;
        console.log('myid', connectedSession.id);
        sendNotification();
        // Display user number
        // document.getElementById('my-number').innerHTML = 'Your number is ' + connectedSession.id;
        console.log('opponentId', opponentId);
        // const { userData = {} } = session.getContact(opponentId);
        // console.log("userData", userData);
        // if (!isDoCall) {
        //   if (userData.id === opponentId) {
        //     isDoCall = true;
        //     doCallUser();
        //   }
        // }

        connectedSession
          .on('incomingCall', invitation => {
            // invitation.accept().then( (call) => {
            // this.currentCall = call;
            // this.setCallListeners();
            // this.onCall = true;
            // this.onStartCall();
            // this.onAccept();
            // });
            invitation.accept().then(call => {
              getDetailAndCall(call);
            });
          })
          .on('contactData', data => {
            console.log('contactData', data);
          });
      })
      .catch(error => {
        // sendMessageToNative({
        //   process: 'failed_register_server'
        // });
        console.error('User agent registration failed', error);
      });
  }

  return (
    <>
      <Layout style={{ background: 'rgba(0, 0, 0, 0.25)' }}>
        <div>
          <div
            id="local-stream"
            className={isLocalStreamAvailable ? 'connected' : ''}
          />
        </div>
        <div>
          <div
            id="remote-stream"
            className={isRemoteStreamAvailable ? 'connected' : ''}
          />
        </div>
        {status === 'connected' ? (
          <div id="call-countdown">
            <h3 className="call-name">{data.patient_name}</h3>
            <Countdown
              valueStyle={{ fontSize: '1em' }}
              value={moment().add(data.rangeTime, 'seconds')}
              format={'mm:ss'}
              onFinish={() => onEndCall('timesup')}
            />
          </div>
        ) : null}

        {['calling', 'ringing', 'connecting'].includes(status) ? (
          <div id="call-header">
            <div id="call-user-info">
              <img
                src="https://www.w3schools.com/howto/img_avatar.png"
                alt="Avatar"
                className="avatar"
              />
              <h3 className="call-name">{data.patient_name}</h3>
              <h4 className="call-question">{data.complaint}</h4>

              {status === 'ringing' && showWaiting ? (
                <>
                  <br />
                  <h5>Memanggil pasien dalam waktu</h5>
                  <Countdown
                    valueStyle={{ fontSize: '1em' }}
                    value={moment().add(120, 'seconds')}
                    format={'mm:ss'}
                    onFinish={() => finishWaitingCountDown()}
                  />
                </>
              ) : (
                <h5 id="call-status">{status}...</h5>
              )}
            </div>
          </div>
        ) : null}

        <div id="call-footer">
          {['calling', 'ringing'].includes(status) ? (
            <Button
              className="button-proses"
              type="danger"
              shape="circle"
              icon={<CloseOutlined />}
              size={'large'}
              onClick={onClickCancel}
            />
          ) : status === 'connected' ? (
            <>
              <Button
                className="button-proses"
                type="danger"
                shape="circle"
                icon={<PhoneFilled style={{ transform: 'rotate(225deg)' }} />}
                size={'large'}
                onClick={onClickHangup}
              />
              <div style={{ width: 25 }} />
              <Button
                className="button-proses button-proses-warning"
                type="primary"
                shape="circle"
                icon={<DiffOutlined />}
                size={'large'}
                onClick={onClickMedicalRecord}
              />
            </>
          ) : null}
        </div>
      </Layout>
      <Modal
        wrapClassName="modal-rekam-medis"
        style={{ top: 2 }}
        title="Rekam Medis"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        destroyOnClose={true}
      >
        <div id="medical-record-list">
          {loadingMedical ? <Skeleton active /> : null}
          {listMedical.map((item, index) => {
            return (
              <div className="medical-card" key={item.code + index}>
                <div className="medical-header">
                  <label>
                    <small>
                      No Rekam Medis :{' '}
                      <span style={{ color: 'blue' }}>{item.code}</span>
                    </small>
                    <br />
                    <small>Order ID : {item.order_code}</small>
                  </label>
                </div>
                <div className="row no-gutters medical-profile">
                  <div className="col-2">
                    <div className="medical-avatar align-center" slot="start">
                      <img
                        src={
                          item.doctor_picture
                            ? item.doctor_picture
                            : 'https://www.w3schools.com/howto/img_avatar.png'
                        }
                      />
                    </div>
                  </div>
                  <div className="col-10 medical-profile-info label-gray">
                    <div className="row no-gutters">
                      <div className="col">
                        <div className="align-center" style={{ color: '#000' }}>
                          <b>{item.doctor_name || item.partner_name}</b>
                        </div>
                      </div>
                      <div className="col text-right" slot="end">
                        <p>{item.service_name}</p>
                        <p>
                          <small>
                            {moment(item.created_at).format(
                              'dddd, D MMM YYYY HH:mm'
                            )}
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="medical-detail">
                  <div className="item">
                    <p className="label-gray">Jenis Anamnesis</p>
                    <p style={{ marginTop: '10px' }}>{item.anamnesis_type}</p>
                  </div>
                  <div className="item">
                    <p className="label-gray">Diagnosis</p>
                    <p style={{ marginTop: '10px' }}>{item.diagnosis}</p>
                  </div>
                  <div className="item">
                    <p className="label-gray">Terapi/Obat</p>
                    <p style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                      {item.medicine}
                    </p>
                  </div>
                  <div className="item">
                    <p className="label-gray">Pemeriksaan Penunjang</p>
                    <p style={{ marginTop: '10px' }}>{item.followup}</p>
                  </div>
                  <div
                    className="item"
                    lines="none"
                    style={{ marginBottom: '10px' }}
                  >
                    <p className="label-gray">Notes and Allergies</p>
                    <p style={{ marginTop: '10px' }}>{item.followup_note}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}

ReactDOM.render(<VcallPartner />, document.getElementById('container'));
