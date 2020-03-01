const INITIAL_FETCH_LIMIT = 2000

steem.api.setOptions({ url: 'https://api.steemit.com' })
load()
var users = {}

async function load() {
	let accountHistory = await steem.api.getAccountHistoryAsync('rcr', -1, INITIAL_FETCH_LIMIT)

	if (!accountHistory) return
	
	accountHistory = accountHistory.reverse()
	console.log(accountHistory);
	
	accountHistory.forEach((tx) => {
		let txType = tx[1].op[0]
		let txData = tx[1].op[1]
		if (txType === 'transfer') {
			if (txData['from'] == 'fundacja') {
				let match = txData['memo'].match(/([^\s]+)/g)
				if (match != null) {
					let user = match[0];
					let timestamp = tx[1]['timestamp'];
					let amount = match[1];
					let total = match[5];
					if (!users.hasOwnProperty(user))
						users[user] = { 
							timestamp: timestamp, 
							total: total,
							txs: [
								{ timestamp: timestamp, amount: amount }
							]
						};
					else {
						users[user]['txs'].push(
							{ timestamp: timestamp, amount: amount }
						)
					}
				}
			}
		}
	});
	console.log(users);
	render();
}

function render() {
	let table = document.getElementById('myTable').getElementsByTagName('tbody')[0];
	for (let user in users) {
		let row = table.insertRow(table.rows.length);
		row.setAttribute("data-toggle", "collapse");
		row.setAttribute("data-target", "." + user);
		cell = row.insertCell(row.cells.length).innerHTML = "<i class='fas fa-chevron-down' data-toggle='collapse' data-target='" + user + "'></i>";
		//cell.setAttribute("data-toggle", "collapse");
		//cell.setAttribute("data-target", "." + user);
		row.insertCell(row.cells.length).innerHTML = user;
		row.insertCell(row.cells.length).innerHTML = users[user]['timestamp'].replace('T', ' ');
		row.insertCell(row.cells.length).innerHTML = users[user]['total'];
		//row.insertCell(row.cells.length).innerHTML = 
		//	"<input type='text' id='" + user + "' name='" + user + "'>\
		//	 <button type='text' onClick=add('"+user+"')>+</button>\
		//	 <button type='text' onClick=subtract('"+user+"')>-</button>";
		
		row.insertCell(row.cells.length).innerHTML = 
			"<div class='input-group'>\
				<input type='text' class='form-control' id='" + user + "' name='" + user + "'>\
				<div class='input-group-append'>\
					<button type='button' class='btn btn-outline-secondary btn-sm' onClick=add('"+user+"')>Dodaj</button>\
					<button type='button' class='btn btn-outline-secondary btn-sm' onClick=subtract('"+user+"')>Odejmij</button>\
				</div>\
			</div>"
		
		for (let tx in users[user]['txs']) {
			row = table.insertRow(table.rows.length);
			row.className = 'collapse table-info ' + user;
			cell = row.insertCell(row.cells.length).innerHTML = '';
			cell = row.insertCell(row.cells.length).innerHTML = user;
			cell = row.insertCell(row.cells.length).innerHTML = users[user]['txs'][tx]['timestamp'].replace('T', ' ');
			cell = row.insertCell(row.cells.length).innerHTML = users[user]['txs'][tx]['amount'];
			cell = row.insertCell(row.cells.length).innerHTML = '';
		}
	}
}

function add(who) {
	amount = document.getElementById(who).value
	sendSteemConnect(who, '%2B' + amount, (parseInt(users[who]['total']) + parseInt(amount)).toString());
}

function subtract(who) {
	amount = document.getElementById(who).value
	sendSteemConnect(who, '%2D' + amount, (parseInt(users[who]['total']) - parseInt(amount)).toString());
}

function sendSteemConnect(who, amount, total){
	window.open('https://steemconnect.com/sign/transfer?from=mys&to=rcr&amount=0.001%20STEEM&memo=' + who + '%20' + amount + '%20RCR%20/%20suma:%20' + total + '%20RCR', '_blank').focus();
}