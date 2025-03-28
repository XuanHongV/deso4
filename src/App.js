import React, { useState, useEffect } from 'react';
import { LocalNotifications, Permissions as LocalNotificationsPermissions } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource, Permissions } from '@capacitor/camera';

function App() {
    const [currentTime, setCurrentTime] = useState('');
    const [notificationPermission, setNotificationPermission] = useState(null);
    const [cameraPermission, setCameraPermission] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        requestNotificationPermission();
        requestCameraPermission();
    }, []);

    const requestNotificationPermission = async () => {
        const status = await LocalNotificationsPermissions.request({ permissions: ['notifications'] });
        setNotificationPermission(status.notifications);
    };

    const requestCameraPermission = async () => {
        const status = await Permissions.request({ permissions: ['camera'] });
        setCameraPermission(status.camera);
    };

    const showTime = async () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        setCurrentTime(timeString);

        if (notificationPermission === 'granted') {
            await LocalNotifications.schedule({
                notifications: [{
                    title: 'Thông báo thời gian',
                    body: `Bây giờ là ${timeString}.`,
                    id: 1,
                    schedule: { at: new Date(Date.now() + 1000) },
                }]
            });
        } else {
            alert('Thông báo không được phép. Hãy cấp quyền để nhận thông báo.');
        }
    };

    const shareTime = async () => {
        const text = `Thời gian hiện tại: ${currentTime}`;
        if (currentTime) {
            try {
                await Share.share({
                    title: 'Chia sẻ thời gian',
                    text: text,
                    dialogTitle: 'Chia sẻ thời gian hiện tại'
                });
            } catch (error) {
                console.error('Lỗi khi chia sẻ:', error);
                alert('Không thể chia sẻ thời gian.');
            }
        } else {
            alert('Không có thông tin để chia sẻ!');
        }
    };

    const takePhoto = async () => {
        if (cameraPermission === 'granted') {
            try {
                const photo = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: true,
                    resultType: CameraResultType.Uri,
                    source: CameraSource.Camera,
                });
                setCapturedImage(photo.webPath);
            } catch (error) {
                console.error('Lỗi khi chụp ảnh:', error);
                alert('Không thể chụp ảnh.');
            }
        } else {
            alert('Camera không được phép. Hãy cấp quyền để chụp ảnh.');
        }
    };

    const sharePhoto = async () => {
        if (capturedImage) {
            try {
                await Share.share({
                    title: 'Ảnh chụp',
                    url: capturedImage,
                    dialogTitle: 'Chia sẻ ảnh chụp'
                });
            } catch (error) {
                console.error('Lỗi khi chia sẻ ảnh:', error);
                alert('Không thể chia sẻ ảnh.');
            }
        } else {
            alert('Hãy chụp ảnh trước khi chia sẻ.');
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            {/* ... (phần giao diện hiển thị thời gian và chia sẻ) */}
            <div>
                <button onClick={takePhoto}>Chụp ảnh</button>
                {capturedImage && <img src={capturedImage} alt="Ảnh chụp" style={{ maxWidth: '200px' }} />}
                {capturedImage && <button onClick={sharePhoto}>Chia sẻ ảnh</button>}
            </div>
        </div>
    );
}

export default App;