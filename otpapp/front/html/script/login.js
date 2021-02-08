if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterLoaded);
} else {
    afterLoaded();
}

function afterLoaded() {
	async function getToken(username, password, uri) {
	let reply = await fetch(uri, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({'password':password})
	});
	const status = await reply.status;
	const result = await reply.json();
	if (status == 200) {
		return result
		} else { return [status,result] }
	}
	
	var form = document.getElementById('loginform');
	form.addEventListener('submit', async function () {
		var user = document.getElementById('loginuser').value
		var pass = document.getElementById('loginpassword').value
		let token = await getToken(user, pass, baseURL+'getToken');
		if (token[0] != 400) {
			var now = new Date();
			var time = now.getTime();
			time += 3600 * 1000;
			now.setTime(time);
			document.cookie = 'token=' + token.token + 
			'; expires=' + now.toUTCString() + 
			'; path=/' + '; samesite=lax';
			window.location.replace("index.html");
		} else {
			msg = document.getElementById('loginmsg')
			msg.innerText = token[1]
		}
	});
};
