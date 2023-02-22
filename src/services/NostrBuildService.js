import { Axios } from "axios"

export const UploadPicture = file => {
    return new Promise((resolve, reject) => {
        let axios = new Axios({ timeout: 3000 });
        let responseRgx = new RegExp(/(https:\/\/nostr.build\/i\/nostr.build[0-9a-z._]*)/, 'gmi');
        let formData = new FormData();
        formData.append('fileToUpload', file);
        console.log(formData);
        axios.post('https://nostr.build/upload.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        ).then(response => {
            let uploadedUrl = responseRgx.exec(response.data);
            if (uploadedUrl) {
                uploadedUrl = uploadedUrl[0]
                resolve(uploadedUrl);
            }
        }).catch(err => {
            console.log(err);
        });
    })
}