var baseURL = 'https://tgc1-otp.tgc1.local:8080/'

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterLoaded);
} else {
    afterLoaded();
}

function afterLoaded() {
        async function getqr() {
                uname = new URLSearchParams(window.location.search).get('username')
                let reply = await fetch(accessURL+'qr/get'+'?username='+uname, {
                method: 'GET' });
                const status = await reply.status;
                const result = await reply.json();
                if (status == 200) {
                        var qr_code = result.qrlink;
                        var qr = new QRious({
                                element: document.getElementById('qr'),
                                value: qr_code,
                                });
                        qr.size = 201;
                        setTimeout(function() {
                                location.reload();
                                }, 1800000);
                        } else {
                                document.getElementById('errmsg').innerText = result;
                                }
                        }
        getqr();
}
