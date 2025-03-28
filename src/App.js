import React, { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import './App.css';

function App() {
    const [currentTime, setCurrentTime] = useState('');
    const [notificationPermission, setNotificationPermission] = useState(null);
    const [cameraPermission, setCameraPermission] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        checkNotificationPermission();
        checkCameraPermission();
    }, []);

    const checkNotificationPermission = async () => {
        const { display } = await LocalNotifications.checkPermissions();
        setNotificationPermission(display);
    };

    const checkCameraPermission = async () => {
        const { camera } = await Camera.checkPermissions();
        setCameraPermission(camera);
    };

    const requestNotificationPermission = async () => {
        const { display } = await LocalNotifications.requestPermissions();
        setNotificationPermission(display);
        return display;
    };

    const requestCameraPermission = async () => {
        const { camera } = await Camera.requestPermissions();
        setCameraPermission(camera);
        return camera;
    };

    const showTime = async () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;
        
        setCurrentTime(timeString);

        let permission = notificationPermission;
        if (permission !== 'granted') {
            permission = await requestNotificationPermission();
        }

        if (permission === 'granted') {
            await LocalNotifications.schedule({
                notifications: [{
                    title: 'Thời gian hiện tại',
                    body: timeString,
                    id: 1,
                    schedule: { at: new Date(Date.now() + 1000) },
                }]
            });
        } else {
            alert('Thông báo không được phép. Hãy cấp quyền trong cài đặt ứng dụng.');
        }
    };

    const shareTime = async () => {
        if (!currentTime) {
            alert('Vui lòng hiển thị thời gian trước khi chia sẻ');
            return;
        }

        try {
            await Share.share({
                title: 'Thời gian hiện tại',
                text: `Bây giờ là ${currentTime}`,
                dialogTitle: 'Chia sẻ thời gian'
            });
        } catch (error) {
            console.error('Lỗi khi chia sẻ:', error);
            alert('Không thể chia sẻ thời gian');
        }
    };

    const takePhoto = async () => {
        let permission = cameraPermission;
        if (permission !== 'granted') {
            permission = await requestCameraPermission();
        }

        if (permission === 'granted') {
            try {
                const photo = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: false,
                    resultType: CameraResultType.Uri,
                    source: CameraSource.Camera,
                });
                
                // Lưu ảnh vào bộ nhớ
                const savedFile = await Filesystem.writeFile({
                    path: `photos/${Date.now()}.jpeg`,
                    data: photo.base64String || '',
                    directory: Directory.Data,
                });
                
                setCapturedImage(photo.webPath);
                alert('Ảnh đã được lưu thành công!');
            } catch (error) {
                console.error('Lỗi khi chụp ảnh:', error);
                alert('Không thể chụp ảnh: ' + error.message);
            }
        } else {
            alert('Camera không được phép. Hãy cấp quyền trong cài đặt ứng dụng.');
        }
    };

    const sharePhoto = async () => {
        if (!capturedImage) {
            alert('Không có ảnh để chia sẻ');
            return;
        }

        try {
            await Share.share({
                title: 'Ảnh chụp màn hình',
                url: capturedImage,
                dialogTitle: 'Chia sẻ ảnh chụp'
            });
        } catch (error) {
            console.error('Lỗi khi chia sẻ ảnh:', error);
            alert('Không thể chia sẻ ảnh');
        }
    };

    return (
      <div className="app-container">
          <h1>Hiển Thị Thời Gian</h1>

          <div className="time-display">
              {currentTime || 'Nhấn nút để xem thời gian'}
          </div>

          <div className="button-group">
              <button className="btn-show-time" onClick={showTime}>
                  Hiển Thị Thời Gian
              </button>

              <button className="btn-share-time" onClick={shareTime}>
                  Chia Sẻ Thời Gian
              </button>
          </div>

          <div className="screenshot-section">
              <button className="btn-take-photo" onClick={takePhoto}>
                  Chụp Ảnh Màn Hình
              </button>

              {capturedImage && (
                  <div className="photo-preview">
                      <img src={capturedImage} alt="Ảnh chụp" />
                      <button className="btn-share-photo" onClick={sharePhoto}>
                          Chia Sẻ Ảnh
                      </button>
                  </div>
              )}
          </div>
      </div>
  );
}

export default App;