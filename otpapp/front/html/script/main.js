
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', afterLoaded);
} else {
    afterLoaded();
}

function afterLoaded() {
	
	async function checkToken(token) {
		let reply = await fetch(baseURL+'hello', {
			method: 'GET',
			headers: {
			'Content-Type': 'application/json',
			'Authorization':'Bearer '+cookie
		}
	});
	const status = await reply.status;
	const result = await reply.json();
	if (status == 200) {
		return true
		} else { window.location.replace("login.html"); }
	}
	
	var cookie = document.cookie.split('=')[1]
	/* check cookie is valid token for API */
	if (cookie != undefined) {
		checkToken(cookie)
	} else {
		window.location.replace("login.html")
	}
	
	var topMenu = document.querySelector('.menu');
	var gear = document.getElementById('gear');

	/*    Main functions goes here    */
	
	/* Rreport a BUG */
	document.querySelector('.bug_repot').addEventListener('click', function() {
		console.log('bug');
		location.href = "mailto: admin@vxlan.ru?subject=OTP Server BUG report";
	});
	
	/* Home button */
	document.querySelector('.home').addEventListener('click', function() {
		location.reload();
	});
	
	/* Admin password change */
	var adminpass = document.querySelector(".passwd_change");
	adminpass.addEventListener("click", function(event) {
		topMenu.style.visibility = "hidden";
		gear.style.visibility = "visible";
		topMenu.style.opacity = 0;
		gear.style.opacity = 0.7;
		var pwform = document.querySelector(".password-div");
		var errmsg = document.getElementById('passerrnmsg');
		errmsg.innerText = ("");
		pwform.style.visibility = "visible";
		close = document.createElement('p');
		close.innerHTML = 'x';
		close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
		close.style.top = '-30px';
		close.style.right = '10px';
		pwform.appendChild(close);
		close.addEventListener("click", function(event) {
			pwform.style.visibility = "hidden";
			document.getElementById('oldpass').value = '';
			document.getElementById('newpass').value = '';
			document.getElementById('reppass').value = '';
			topMenu.style.visibility = "visible";
			topMenu.style.opacity = 1;
			gear.style.visibility = "hidden";
			gear.style.opacity = 0;
			pwform.removeEventListener('submit', pwform.fn);
		});
		pwform.addEventListener('submit', pwform.fn = async function fn() {
		var oldpass = document.getElementById('oldpass').value
		var newpass = document.getElementById('newpass').value
		var reppass = document.getElementById('reppass').value
		if (newpass != reppass) {
			errmsg.innerText = ("Password's doesn't match")
			} else {
				errmsg.innerText = ("");
				let reply = await fetch(baseURL+'changePsw', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization':'Bearer '+cookie,
						},
					body: JSON.stringify({'oldpass':oldpass, 'newpass':newpass})
					});
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) {
						errmsg.innerText = ("Password changed");
						document.getElementById('oldpass').value = '';
						document.getElementById('newpass').value = '';
						document.getElementById('reppass').value = '';
						close.addEventListener("click", function(event) {
							window.location.replace("login.html");
							});
						} else {
							errmsg.innerText = result;
						}
					}
		});
	});
	
	/* Manage NAD */
	var managenad = document.querySelector(".manage_nad");
	var nadeditor = document.querySelector('.nad-editor');
	managenad.addEventListener("click", async function(event) {
		topMenu.style.visibility = "hidden";
		gear.style.visibility = "visible";
		topMenu.style.opacity = 0;
		gear.style.opacity = 0.7;
		document.getElementById('nad_status').innerText = ''
		var textar = document.getElementById('nad-text');
		nadeditor.style.visibility = 'visible';
		textar.value = '';
		let reply = await fetch(baseURL+'nad', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization':'Bearer '+cookie,
						},
					});
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) {
						textar.value = result.output.join('');
					}
		var nadsave = document.getElementById('nad_submit');
		var nadcancel = document.getElementById('nad_cancel');
		nadsave.addEventListener('click', nadsave.fn = async function fn () {
			var nadput = {'nad':textar.value};
			let reply = await fetch(baseURL+'nad', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization':'Bearer '+cookie,
						},
					body: JSON.stringify(nadput),
					});
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) {
						document.getElementById('nad_status').innerText = 'Saved';
					} else {
						document.getElementById('nad_status').innerText = 'Error: '+result;
					}
			
		});
		nadcancel.addEventListener('click', nadcancel.fn = function fn () {
			document.getElementById('nad_status').innerText = '';
			nadcancel.removeEventListener('click', nadcancel.fn);
			nadsave.removeEventListener('click', nadsave.fn);
			nadeditor.style.visibility = 'hidden';
			topMenu.style.visibility = "visible";
			topMenu.style.opacity = 1;
			gear.style.visibility = "hidden";
			gear.style.opacity = 0;
		});
		
	});
	
	/* User Add */
	var useraddform = document.querySelector(".user_add");
	useraddform.addEventListener("click", function(event) {
		topMenu.style.visibility = "hidden";
		gear.style.visibility = "visible";
		topMenu.style.opacity = 0;
		gear.style.opacity = 0.7;
		var usform = document.querySelector('.userpass-div');
		var errmsg = document.getElementById('usaddmsg');
		usaddmsg.innerText = ("");
		usform.style.visibility = "visible";
		close = document.createElement('p');
		close.innerHTML = 'x';
		close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
		close.style.top = '-30px';
		close.style.right = '10px';
		usform.appendChild(close);
		close.addEventListener("click", function(event) {
			usform.style.visibility = "hidden";
			document.getElementById('nusername').value = '';
			document.getElementById('nuemail').value = '';
			topMenu.style.visibility = "visible";
			gear.style.visibility = "hidden";
			gear.style.opacity = 0;
			topMenu.style.opacity = 1;
			usform.removeEventListener('submit', usform.fn);
		});
		var usernInp = document.getElementById('nusername')
		var emailInp = document.getElementById('nuemail')
		emailInp.addEventListener('focus', function(event) {
			emailInp.value = usernInp.value+'@'+domain; 
		});
		usform.addEventListener('submit', usform.fn = async function fn() {
			var username = usernInp.value;
			var email = emailInp.value;
			usaddmsg.innerText = ("");
			let reply = await fetch(baseURL+'users/add'+'?username='+username+'&email='+email, {
					method: 'POST',
					headers: {
						'Authorization':'Bearer '+cookie,
						},
					});
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) {
						usernInp.value = '';
						emailInp.value = '';
						usform.style['pointer-events'] = 'none';
						var qr_code = result.qrcode
						usaddmsg.innerText = ("User added");
						var qrdiv = document.querySelector('.user-qr');
						qrdiv.style.visibility = "visible";
						var qr = new QRious({
							element: document.getElementById('qr'),
							value: qr_code
							});
						qr.size = 201;
						var dbutt = document.getElementById('qr_download');
						dbutt.addEventListener('click', dbutt.fn = function fn () {
							var canvas = document.getElementById("qr");
							image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
							var link = document.createElement('a');
							link.download = username+".png";
							link.href = image;
							link.click();
							});
						close = document.createElement('p');
						close.innerHTML = 'x';
						close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
						close.style.top = '-30px';
						close.style.right = '10px';
						qrdiv.appendChild(close);
						close.addEventListener("click", function(event) {
							qrdiv.style.visibility = "hidden";
							usform.style['pointer-events'] = 'auto';
							dbutt.removeEventListener('click', dbutt.fn);
							ebutt.removeEventListener('click', ebutt.fn);
							});
						var ebutt = document.getElementById('qr_email');
						ebutt.addEventListener('click', ebutt.fn = function fn() {
							location.href = "mailto: "+email+"?subject=QR-code for VPN access&body=QR code is available here: "+
							accessURL+"qrcode.html?username="+username+"%0D%0A Get Google Authenticator application"+
							"%0D%0A from App Store of Google Play Market to scan QR code";
						});
					} else {
						usaddmsg.innerText = result;
					}
						
			
		});	
	});
	
	/* Get User QR Code */
	var userqrform = document.querySelector(".user_qr_get");
	userqrform.addEventListener("click", function(event) {
		topMenu.style.visibility = "hidden";
		gear.style.visibility = "visible";
		gear.style.opacity = 0.7;
		topMenu.style.opacity = 0;
		var usqrform = document.querySelector('.userqr-div');
		var qrmsg = document.getElementById('qrmsg');
		qrmsg.innerText = ("");
		usqrform.style.visibility = "visible";
		close = document.createElement('p');
		close.innerHTML = 'x';
		close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
		close.style.top = '-30px';
		close.style.right = '10px';
		usqrform.appendChild(close);
		close.addEventListener("click", function(event) {
			usqrform.style.visibility = "hidden";
			document.getElementById('qrusername').value = '';
			topMenu.style.visibility = "visible";
			gear.style.visibility = "hidden";
			gear.style.opacity = 0;
			topMenu.style.opacity = 1;
			usqrform.removeEventListener('submit', usqrform.fn);
			});
		var usernqr = document.getElementById('qrusername')
		usqrform.addEventListener('submit', usqrform.fn = async function fn() {
			var qrname = usernqr.value;
			qrmsg.innerText = ("");
			let reply = await fetch(baseURL+'users/get'+'?username='+qrname, {
					method: 'GET',
					headers: {
						'Authorization':'Bearer '+cookie,
						},
					});
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) {
						usqrform.style['pointer-events'] = 'none';
						var qr_code = result[0].qrlink;
						var qr_user = result[0].username;
						var qr_email = result[0].email;
						usernqr.value = "";
						qrmsg.innerText = "QR code for: "+qr_user;
						var qrdiv = document.querySelector('.user-qr');
						qrdiv.style.visibility = "visible";
						var qr = new QRious({
							element: document.getElementById('qr'),
							value: qr_code
							});
						qr.size = 201;
						var dbutt = document.getElementById('qr_download');
						dbutt.addEventListener('click', dbutt.fn = function fn() {
							var canvas = document.getElementById("qr");
							image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
							var link = document.createElement('a');
							link.download = qr_user+".png";
							link.href = image;
							link.click();
							});
						close = document.createElement('p');
						close.innerHTML = 'x';
						close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
						close.style.top = '-30px';
						close.style.right = '10px';
						qrdiv.appendChild(close);
						close.addEventListener("click", function(event) {
							qrdiv.style.visibility = "hidden";
							usqrform.style['pointer-events'] = 'auto';
							dbutt.removeEventListener('click', dbutt.fn);
							ebutt.removeEventListener('click', ebutt.fn);
							});
						var ebutt = document.getElementById('qr_email');
						ebutt.addEventListener('click', ebutt.fn = function fn() {
                                                        location.href = "mailto: "+qr_email+"?subject=QR-code for VPN access&body=QR code is available here: "+
                                                        accessURL+"qrcode.html?username="+qr_user+"%0D%0A Get Google Authenticator application"+
                                                        "%0D%0A from App Store of Google Play Market to scan QR code";
						});
					} else {
						qrmsg.innerText = result;
					}
		});
		
	});
	
	/* Lock/Unlock User */
	var userlockform = document.querySelector(".user_lock");
	userlockform.addEventListener("click", function(event) {
		topMenu.style.visibility = "hidden";
		topMenu.style.opacity = 0;
		gear.style.visibility = "visible";
		gear.style.opacity = 0.7;
		var lockdiv = document.querySelector('.userlock-div');
		var lockmsg = document.getElementById('lockmsg');
		lockmsg.innerText = ("");
		lockdiv.style.visibility = "visible";
		close = document.createElement('p');
		close.innerHTML = 'x';
		close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
		close.style.top = '-30px';
		close.style.right = '10px';
		lockdiv.appendChild(close);
		close.addEventListener("click", function(event) {
			lockdiv.style.visibility = "hidden";
			document.getElementById('lockusername').value = '';
			lockmsg.innerText = ("");
			topMenu.style.visibility = "visible";
			topMenu.style.opacity = 1;
			gear.style.visibility = "hidden";
			gear.style.opacity = 0;
			lockbtn.removeEventListener('click', lockbtn.fn);
			unlockbtn.removeEventListener('click', unlockbtn.fn);
			});
		var usern = document.getElementById('lockusername')
		var lockbtn = document.getElementById('user_lock')
		var unlockbtn = document.getElementById('user_unlock')
		lockbtn.addEventListener('click', lockbtn.fn = async function fn(event) {
			var luname = usern.value;
			lockmsg.innerText = ("");
			let reply = await fetch(baseURL+'users/disable'+'?username='+luname, {
					method: 'PUT',
					headers: {
						'Authorization':'Bearer '+cookie,
						},
					});
			const status = await reply.status;
			const result = await reply.json();
			if (status == 200) {
				lockmsg.innerText = ("User Locked");
			} else {
				lockmsg.innerText = (result);
			}
		});
		unlockbtn.addEventListener('click', unlockbtn.fn = async function fn(event) {
			var luname = usern.value;
			lockmsg.innerText = ("");
			let reply = await fetch(baseURL+'users/enable'+'?username='+luname, {
					method: 'PUT',
					headers: {
						'Authorization':'Bearer '+cookie,
						},
					});
			const status = await reply.status;
			const result = await reply.json();
			if (status == 200) {
				lockmsg.innerText = ("User Unlocked");
			} else {
				lockmsg.innerText = (result);
			}
		});
	});
	
	/* Delete User */
		var userdelform = document.querySelector(".user_del");
		userdelform.addEventListener("click", function(event) {
			topMenu.style.visibility = "hidden";
			topMenu.style.opacity = 0;
			gear.style.visibility = "visible";
			gear.style.opacity = 0.7;
			var deldiv = document.querySelector('.deleteuser-div');
			var delmsg = document.getElementById('delmsg');
			delmsg.innerText = ("");
			deldiv.style.visibility = "visible";
			close = document.createElement('p');
			close.innerHTML = 'x';
			close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
			close.style.top = '-30px';
			close.style.right = '10px';
			deldiv.appendChild(close);
			close.addEventListener("click", function(event) {
				deldiv.style.visibility = "hidden";
				document.getElementById('delusername').value = '';
				delmsg.innerText = ("");
				topMenu.style.visibility = "visible";
				topMenu.style.opacity = 1;
				gear.style.visibility = "hidden";
				gear.style.opacity = 0;
				deldiv.removeEventListener('submit', deldiv.fn);
			});
			var dusern = document.getElementById('delusername')
			deldiv.addEventListener('submit', deldiv.fn = async function fn () {
				var duname = dusern.value;
				delmsg.innerText = ("");
				var areyousure = document.querySelector('.areyousure-div');
				deldiv.style['pointer-events'] = 'none';
				areyousure.style.visibility = 'visible';
				areyousure.childNodes[1].innerText = 'Are you sure to delete '+duname+' user ?';
				var yessure = document.getElementById('yessure')
				yessure.addEventListener('click', yessure.fn = async function fn() {
					let reply = await fetch(baseURL+'users/delete'+'?username='+duname, {
						method: 'POST',
						headers: {
							'Authorization':'Bearer '+cookie,
							},
						});
					areyousure.style.visibility = "hidden";
					deldiv.style['pointer-events'] = 'auto';
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) {
						delmsg.innerText = ("User "+duname+" Deleted");
						yessure.removeEventListener('click', yessure.fn);
						notsure.removeEventListener('click', notsure.fn);
					} else {
						delmsg.innerText = (result);
						yessure.removeEventListener('click', yessure.fn);
						notsure.removeEventListener('click', notsure.fn);
					}
					
				});
				var notsure = document.getElementById('notsure')
				notsure.addEventListener('click', notsure.fn = function fn() { 
					delmsg.innerText = ("");
					areyousure.style.visibility = 'hidden';
					deldiv.style['pointer-events'] = 'auto';
					yessure.removeEventListener('click', yessure.fn);
					notsure.removeEventListener('click', notsure.fn);
				});
			});
		});
			
	
	/* Manage Users */
	
	
	var usernamageform = document.querySelector(".user_manage");
	usernamageform.addEventListener("click", function(event) {
		topMenu.style.visibility = "hidden";
		topMenu.style.opacity = 0;
		gear.style.visibility = "visible";
		gear.style.opacity = 0.7;
		var usersrc = document.getElementById('serchuser');
		usersrc.value = "";
		var mngdiv = document.querySelector('.usernamage-div');
		mngdiv.style.visibility = "visible";
			close = document.createElement('p');
			close.innerHTML = 'x';
			close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
			close.style.top = '-30px';
			close.style.right = '10px';
			mngdiv.appendChild(close);
			close.addEventListener("click", function(event) {
				mngdiv.style.visibility = "hidden";
				selecteduserName = null;
				topMenu.style.visibility = "visible";
				topMenu.style.opacity = 1;
				gear.style.visibility = "hidden";
				gear.style.opacity = 0;
				usersrc.removeEventListener('change', usersrc.fn);
				page.removeEventListener('click', page.fn);
				userselUl.removeEventListener('mousedown', userselUl.fn);
				useraction.removeEventListener('mousedown', useraction.fn);
			});
			close.addEventListener("mouseover", function(event) {
				close.style.opacity = 0.9;
				close.style.scale = 1.1;
			});
			close.addEventListener("mouseout", function(event) {
				close.style.opacity = 0.5;
				close.style.scale = 1;
			});
		
		/* user namage main functions */
		
		var allusers = '';
		var selectedUserName = '';
		var numberOfUsers;
		var usersPerPage;
		var numberOfPages;
		var clickforward = 0;
		var clicback = 0;
		var usersOnLastPage;
		var userul = document.querySelector('.users-selection');
		
		function userlist() {
			
			userul.innerHTML = ""
			for (var i = 0; i < allusers.length; i++) {
				var li = document.createElement("li");
				if (allusers[i].username == 'admin') {
					continue;
				}
				if (allusers[i].enabled == true) {
					li.id = "enabled_user";
					li.className = allusers[i].username.split('.').join("");
					li.innerHTML = allusers[i].username;
					userul.appendChild(li)
				} else { 
					li.id = "disabled_user";
					li.className = allusers[i].username.split('.').join("");
					li.innerHTML = allusers[i].username;
					userul.appendChild(li)
				}
			}
		};
		
		async function getusnum() {
			let reply = await fetch(baseURL+'users/number', {
					method: 'GET',
					headers: {
						'Authorization':'Bearer '+cookie,
						},
					});
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) { 
						numberOfUsers = result.users;
						numberOfPages = result.pages;
						usersOnLastPage = result.usersleft;
						usersPerPage = result.usersperpage;
						clickforward = Math.floor(numberOfPages/5);
					}
		};
		
		
		async function getuser(suname, limit, offset) {
			if (suname == '') {
				let reply = await fetch(baseURL+'users/get?all=true&limit='+limit+'&offset='+offset, {
					method: 'GET',
					headers: {
						'Authorization':'Bearer '+cookie,
						},
					});
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) { 
						allusers = result;
					}
			} else {
				let reply = await fetch(baseURL+'users/get?username='+suname+'&limit='+limit+'&offset='+offset, {
					method: 'GET',
					headers: {
						'Authorization':'Bearer '+cookie,
						},
					});
					const status = await reply.status;
					const result = await reply.json();
					if (status == 200) { 
						allusers = result;
					}
			}
		};
			
		
		getusnum().then(() => {
			getuser('',usersPerPage,0).then(() => {
				userlist();
			});
		});
		
		
		/* pagination */
		
		let page = document.querySelector('.usermanage-pagination');
		
		page.addEventListener('click', page.fn = function fn(event) {
			previouselectedUserClass = null;
			if (event.target.innerHTML == '»') {
				if (clickforward > 0) {
					page.querySelectorAll('a:not(#prevnext)').forEach(function(e) {
						e.innerHTML = parseInt(e.innerHTML,10) + 5;
						clickforward -= 1;
						clicback += 1;
					});
				}
				mngdiv.scrollTo({ top: 0, behavior: 'smooth' });
			} else if (event.target.innerHTML == '«') {
				if (clicback > 0) {
					page.querySelectorAll('a:not(#prevnext)').forEach(function(e) {
						e.innerHTML = parseInt(e.innerHTML,10) - 5;
						clicback -= 1;
						clickforward += 1;
					});
				}
				mngdiv.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				nextpage = event.target.innerText;
				if (nextpage > numberOfPages) {
					nextpage = numberOfPages;
				} else {
					page.querySelectorAll('a').forEach(function(e) {
						e.classList.remove('active_page');
					});
					event.target.classList.add('active_page');
					getusnum().then(() => {
						getuser('',usersPerPage,((usersPerPage*(nextpage-1)))).then(() => {
							userlist();
						});
					mngdiv.scrollTo({ top: 0, behavior: 'smooth' });
					});
				}
			}
		});
		
		
		usersrc.addEventListener('change', usersrc.fn = async function fn() {
			previouselectedUserClass = null;
			var userns = usersrc.value;
			var serachurl;
			if (userns == '') {
				serachurl = baseURL+'users/get?all=true';
				page.style.visibility = 'visible';
			} else {
				serachurl = baseURL+'users/get?username='+userns;
				page.style.visibility = 'hidden';
			}
			let reply = await fetch(serachurl, {
					method: 'GET',
					headers: {
						'Authorization':'Bearer '+cookie,
						},
					});
			const status = await reply.status;
			const result = await reply.json();
			if (status == 200) {
				if (userns != '') {
					allusers = result;
					userlist();
				} else {
					allusers = result;
					getusnum().then(() => {
						getuser('',usersPerPage,0).then(() => {
							userlist();
							page.querySelectorAll('a').forEach(function(e) {
								e.classList.remove('active_page');
							});
							page.children[1].classList.add('active_page');
							clicback = 0;
							for (var i = 1; i<6; i++) {
								page.children[i].innerText = i;
							}
						});
					});
				}
			}
		});
		
		var selecteduserName = null;
		var selecteduserClass = null;
		var previouselectedUser = null;
		var previouselectedUserClass = null;
		
		var actionstatus = document.getElementById("useraction-status")
		var userselUl = document.querySelector(".users-selection");
		
		var useraction = document.querySelector('.users-action');
		
		userselUl.addEventListener('mousedown', userselUl.fn = function fn(event) {
			var selecteduser = event.target;
			if (selecteduser.tagName != 'LI') {
				return;
			}
			var bgcolor = 0;
			selecteduserName = event.target.textContent;
			selecteduserClass = event.target.className;
			currentselectedUser = document.querySelector('.'+selecteduserClass)
			selecteduser.style.background = "#4f0235";
			selecteduser.style.color = 'white';
			selecteduser.style.fontWeight = "bold";
			selecteduser.style.transform = ".2s";
			selecteduser.style.scale = "1.05";
			if (previouselectedUserClass) {
				var pus = document.querySelector('.'+previouselectedUserClass)
				if (pus.id == "enabled_user") {
					bgcolor = "#f2f2f2";
				} else {
					bgcolor = "#ff6666";
				}
				pus.style.background = bgcolor;
				pus.style.color = 'black';
				pus.style.fontWeight = "normal";
				pus.style.transform = ".2s";
				pus.style.scale = "1";
				useraction.removeEventListener('click', useraction.fn);
			}
			previouselectedUserClass = selecteduserClass;
			/* do user action */
			
			useraction.addEventListener('click', useraction.fn = function fn(event) {
				switch(event.target.id) {
					case 'unlock_user':
						mngdiv.style['pointer-events'] = 'none'
						fetch(baseURL+'users/enable'+'?username='+selecteduserName, {
							method: 'PUT',
							headers: {
								'Authorization':'Bearer '+cookie,
								},
							}).then(function(reply) {
								if (reply.status !== 200) {
									actionstatus.innerHTML = 'NO';
									actionstatus.style.backgroundColor = '#fda29f';
									actionstatus.style.opacity = 0.8;
									mngdiv.style['pointer-events'] = 'auto';
								} else {
									reply.json().then(function(data) {
									actionstatus.innerHTML = 'OK';
									actionstatus.style.backgroundColor = '#88ffa0';
									actionstatus.style.opacity = 0.8;
									currentselectedUser.id = "enabled_user";
									mngdiv.style['pointer-events'] = 'auto';
								});
								}
							});
						useraction.removeEventListener('click', useraction.fn);
						break;		
						
					case 'lock_user':
						mngdiv.style['pointer-events'] = 'none'
						fetch(baseURL+'users/disable'+'?username='+selecteduserName, {
							method: 'PUT',
							headers: {
								'Authorization':'Bearer '+cookie,
								},
							}).then(function(reply) {
								if (reply.status !== 200) {
									actionstatus.innerHTML = 'NO';
									actionstatus.style.backgroundColor = '#fda29f';
									actionstatus.style.opacity = 0.8;
									mngdiv.style['pointer-events'] = 'auto';
								} else {
									reply.json().then(function(data) {
									actionstatus.innerHTML = 'OK';
									actionstatus.style.backgroundColor = '#88ffa0';
									actionstatus.style.opacity = 0.8;
									currentselectedUser.id = "disabled_user";
									mngdiv.style['pointer-events'] = 'auto';
								});
								}
							});
						useraction.removeEventListener('click', useraction.fn);
						break;	
						
					case 'qrcode_user':
						mngdiv.style['pointer-events'] = 'none';
						var userqrform = document.querySelector(".user_qr_get");
						fetch(baseURL+'users/get'+'?username='+selecteduserName, {
							method: 'GET',
							headers: {
								'Authorization':'Bearer '+cookie,
								},
							}).then(function(reply) {
								if (reply.status !== 200) {
									actionstatus.innerHTML = 'NO';
									actionstatus.style.backgroundColor = '#fda29f';
									actionstatus.style.opacity = 0.8;
									mngdiv.style['pointer-events'] = 'auto';
								} else {
									reply.json().then(function(data) {
									actionstatus.innerHTML = 'OK';
									actionstatus.style.backgroundColor = '#88ffa0';
									actionstatus.style.opacity = 0.8;
									var qr_code = data[0].qrlink;
									var qr_user = selecteduserName;
									var qr_email = data[0].email;
									var qrdiv = document.querySelector('.user-qr');
									qrdiv.style.visibility = "visible";
									var qr = new QRious({
										element: document.getElementById('qr'),
										value: qr_code
										});
									qr.size = 201;
									let dbutt = document.getElementById('qr_download');
									let ebutt = document.getElementById('qr_email');
									dbutt.addEventListener('click', dbutt.fn = function fn(ev) {
										var canvas = document.getElementById("qr");
										image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
										var link = document.createElement('a');
										link.download = qr_user+".png";
										link.href = image;
										link.click();
										});
									ebutt.addEventListener('click', ebutt.fn = function fn() {
			                                                        location.href = "mailto: "+qr_email+"?subject=QR-code for VPN access&body=QR code is available here: "+
                        			                                accessURL+"qrcode.html?username="+qr_user+"%0D%0A Get Google Authenticator application"+
                                                			        "%0D%0A from App Store of Google Play Market to scan QR code";
										});
									close = document.createElement('p');
									close.innerHTML = 'x';
									close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
									close.style.top = '-30px';
									close.style.right = '10px';
									qrdiv.appendChild(close);
									close.addEventListener("click", function(event) {
										qrdiv.style.visibility = "hidden";
										useraction.removeEventListener('click', useraction.fn);
										dbutt.removeEventListener('click', dbutt.fn);
										ebutt.removeEventListener('click', ebutt.fn);
										mngdiv.style['pointer-events'] = 'auto';
										});
									});
								}
							});
						break;
					case 'newqrcode_user':
						mngdiv.style['pointer-events'] = 'none';
						var userqrform = document.querySelector(".user_qr_get");
						fetch(baseURL+'qr/update'+'?username='+selecteduserName, {
							method: 'PUT',
							headers: {
								'Authorization':'Bearer '+cookie,
								},
							}).then(function(reply) {
								if (reply.status !== 200) {
									actionstatus.innerHTML = 'NO';
									actionstatus.style.backgroundColor = '#fda29f';
									actionstatus.style.opacity = 0.8;
									mngdiv.style['pointer-events'] = 'auto';
								} else {
									reply.json().then(function(data) {
									actionstatus.innerHTML = 'OK';
									actionstatus.style.backgroundColor = '#88ffa0';
									actionstatus.style.opacity = 0.8;
									var qr_code = data[0].qrlink;
									var qr_user = selecteduserName;
									var qr_email = data[0].email;
									var qrdiv = document.querySelector('.user-qr');
									qrdiv.style.visibility = "visible";
									var qr = new QRious({
										element: document.getElementById('qr'),
										value: qr_code
										});
									qr.size = 201;
									let dbutt = document.getElementById('qr_download');
									let ebutt = document.getElementById('qr_email');
									dbutt.addEventListener('click', dbutt.fn = function fn(ev) {
										var canvas = document.getElementById("qr");
										image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
										var link = document.createElement('a');
										link.download = qr_user+".png";
										link.href = image;
										link.click();
										});
									ebutt.addEventListener('click', ebutt.fn = function fn() {
			                                                        location.href = "mailto: "+qr_email+"?subject=QR-code for VPN access&body=QR code is available here: "+
                        			                                accessURL+"qrcode.html?username="+qr_user+"%0D%0A Get Google Authenticator application"+
                                                			        "%0D%0A from App Store of Google Play Market to scan QR code";
										});
									close = document.createElement('p');
									close.innerHTML = 'x';
									close.style.cssText = "position:absolute; font-size: 30px; cursor: pointer;";
									close.style.top = '-30px';
									close.style.right = '10px';
									qrdiv.appendChild(close);
									close.addEventListener("click", function(event) {
										qrdiv.style.visibility = "hidden";
										useraction.removeEventListener('click', useraction.fn);
										dbutt.removeEventListener('click', dbutt.fn);
										ebutt.removeEventListener('click', ebutt.fn);
										mngdiv.style['pointer-events'] = 'auto';
										});
									});
								}
							});
						break;
					/*case 'delete_user':
						mngdiv.style['pointer-events'] = 'none';
						var areyousure = document.querySelector('.areyousure-div');
						var duname = selecteduserName;
						let yessureD =  document.getElementById('yessure');
						var notsureD = document.getElementById('notsure');
						areyousure.style.visibility = 'visible';
						areyousure.childNodes[1].innerText = 'Are you sure to delete '+duname+' user ?';
						yessureD.addEventListener('click', yessureD.fn = async function fn() {
							let reply = await fetch(baseURL+'users/delete'+'?username='+duname, {
								method: 'POST',
								headers: {
									'Authorization':'Bearer '+cookie,
									},
								});
							areyousure.style.visibility = "hidden";
							const status = await reply.status;
							const result = await reply.json();
							if (status == 200) {
								actionstatus.innerHTML = 'OK';
								actionstatus.style.backgroundColor = '#88ffa0';
								actionstatus.style.opacity = 0.8;
								yessureD.removeEventListener('click', yessureD.fn);
								notsureD.removeEventListener('click', notsureD.fn);
								mngdiv.style['pointer-events'] = 'auto';
								previouselectedUserClass = null;
								getuser('').then(() => {
									userlist();
								});
							} else {
								actionstatus.innerHTML = 'NO';
								actionstatus.style.backgroundColor = '#fda29f';
								actionstatus.style.opacity = 0.8;
								yessureD.removeEventListener('click', yessureD.fn);
								notsureD.removeEventListener('click', notsureD.fn);
								mngdiv.style['pointer-events'] = 'auto';
							}
							});
						document.getElementById('notsure').addEventListener('click', notsureD.fn = function fn() { 
								delmsg.innerText = ("");
								areyousure.style.visibility = 'hidden';
								yessureD.removeEventListener('click', yessureD.fn);
								notsureD.removeEventListener('click', notsureD.fn);
								mngdiv.style['pointer-events'] = 'auto';
							});
						
						useraction.removeEventListener('click', useraction.fn);
						break;
						*/
					case 'copy_user':
						var cuname = selecteduserName;
						let pcp = document.createElement('textarea');
						pcp.value = cuname;
						pcp.visibility = 'hidden';
						mngdiv.appendChild(pcp);
						pcp.select();
						document.execCommand('copy');
						mngdiv.removeChild(pcp);
					}
				
				});
		
		});
		
				
	});
	
}
