let addBtn = document.querySelector(".button-primary");
let listBtn = document.querySelector(".list");
let form = document.querySelector("form");
let parentDiv = document.querySelector(".cardsContainer");


// form submission
addBtn.addEventListener("click",e=>{
	e.preventDefault();
	let formData = new FormData(form);
	let subjectName = formData.get("add");
	let url = formData.get("url");
	let totalLectures = formData.get("number");

	let data = {
		start : 0,
		subjectName,
		url,
		totalLectures
	};
	sendToServer(data);
});


// listing all the documents!
listBtn.addEventListener("click",e=>{
	e.preventDefault();
	parentDiv.innerHTML = "";
	getFromServer();
});



// send the data from the user to the server!
function sendToServer(data){
	if(verifyData(data)){
		const options = {
		method:'POST',
		headers:{
			'Content-Type':'application/json'
		},
			body:JSON.stringify(data)
		};
	fetch("/addSubject",options)
	.then(response=>response.json())
	.then(data=>{
		if(data){
			handleModal("Added to database successfully!");
			form.reset();
		}
	});
	}else{
		handleModal("Sorry data fields cannot be empty!");
	}
}



// get all the data records from the server!
function getFromServer(){
	fetch("/getAllData")
	.then(response=>response.json())
	.then(data=>{
		if(data.length!==0){
			document.querySelector(".cardsContainer").innerHTML = "";
			for(let i = 0;i<data.length;i++){
				createDom(data[i]);
			}
			listenDeleteClick();
			listenUpdateClick();
		}else{
			document.querySelector(".cardsContainer").innerHTML = "database is empty!";
		}
	});
}

// verify data
function verifyData(data){
	if(data.subjectName.length === 0 || data.url.length === 0 || data.totalLectures === 0){
		return false;
	}else{
		return true;
	}
}


// handling the modal
let modalContainer = document.querySelector(".modal");
function setModal(content){
	let modalContent = content;
	modalContainer.style.display = "flex";
	if(modalContainer.style.display === "flex"){
		let modalContentContainer = document.querySelector(".modalContent");
		modalContentContainer.textContent = modalContent;
	}
}

function hideModal(){
	if(modalContainer.style.display === "flex"){
		modalContainer.style.display = "none";
	}
}

function handleModal(content){
	window.scrollTo(0,0);
	setModal(content);
	setTimeout(hideModal,2500);
}

// calculating the percentage of remaining course length;
function getPercentage(start,total){
	// console.log(typeof(start),typeof(total));
	start = Number(start);
	total = Number(total);
	if(start<=total){
		return Math.round(100-((total-start)/total)*100);
	}
}

// create the card from the data
function createDom(dataObj){
	let card = document.createElement("div");
	card.classList.add("card","container");
	let h3 = document.createElement("h3");
	h3.classList.add("subjectName");
	h3.textContent = dataObj.subjectName;

	let span_hidden = document.createElement("span");
	span_hidden.textContent = dataObj._id;
	span_hidden.classList.add("hideMe");

	h3.appendChild(span_hidden);

	let a = document.createElement("a");
	a.href = dataObj.url;
	a.textContent = dataObj.subjectName.split(" ")[0] || "link";
	a.setAttribute("target","_blank");

	let p = document.createElement("p");
	p.classList.add("totalLectures");

	let span1 = document.createElement("span");
	let span2 = document.createElement("span");
	span1.textContent = "Total Lectures : ";
	span2.classList.add("lectureCount");

	span2.textContent = dataObj.totalLectures;

	let hr = document.createElement("hr");

	let span3 = document.createElement("span");
	span3.textContent = "Completed Lectures: ";
	span3.classList.add("lectureCount");

	let span4 = document.createElement("span");
	span4.classList.add("lectureCount");
	span4.textContent = getPercentage(dataObj.start,dataObj.totalLectures) + "%";
	
	p.append(span1,span2,hr,span3,span4);

	let btnContainer = document.createElement("div");
	btnContainer.classList.add("btn-container");

	let btn1 = document.createElement("button");
	let btn2 = document.createElement("button");
	btn1.textContent = "delete";
	btn1.classList.add("delete");

	btn2.textContent = "update";
	btn2.classList.add("update");

	btnContainer.append(btn1,btn2);

	card.append(h3,a,p,btnContainer);
	parentDiv.append(card);
}

// handling deletion of record!
function deleteRecord(deleteId){
	const options = {
		method:'POST',
		headers:{
			'Content-Type':'application/json'
		},
		body:JSON.stringify({
			id:deleteId
		})
	};
	fetch("/deleteRecord",options)
	.then(response=>{
		if(response.status === 200){
			handleModal("Deleted successfully!");
			parentDiv.innerHTML = "";
			getFromServer();
		}else{
			handleModal("Error deleting record in the server try again later!");
		}
	});
}

// handle click event for the delete button
function listenDeleteClick(){
	let cardContainerElementsCount = document.querySelector(".cardsContainer").children.length;
		if(cardContainerElementsCount !== 0){
			let deleteBtns = document.querySelectorAll(".delete");
			for(let i = 0;i<deleteBtns.length;i++){
				deleteBtns[i].addEventListener("click",e=>{
					e.preventDefault();
					let id = e.target.parentElement.parentElement.children[0].children[0].textContent;
					deleteRecord(id);
			});
		}
	}
}


// handling updating the records
// handle closing the modals
// 
function handleUpdate(updateId,data){
	const dataObject = {
			id:updateId,
			data
	};
	const options = {
		method:'POST',
		headers:{
			'Content-Type':'application/json'
		},
		body:JSON.stringify(dataObject)
	};

	// console.log(dataObject);
	fetch("/updateRecord",options)
	.then(response=>{
		if(response.status === 200){
			window.scrollTo(0,0);
			handleModal("Updated Record successfully!");
			parentDiv.innerHTML = "";
			getFromServer();
		}else{
			window.scrollTo(0,0);
			handleModal("Server problem updating the record!");
		}
	});
}


function listenUpdateClick(){
	let cardContainerElementsCount = document.querySelector(".cardsContainer").children.length;
	if(cardContainerElementsCount !== 0){
		let updateBtns = document.querySelectorAll(".update");
		for(let i = 0;i<updateBtns.length;i++){
			updateBtns[i].addEventListener("click",e=>{
				window.scrollTo(0,0);
				let modalPop = document.querySelector(".update-modal");
				modalPop.style.display = "flex";
				if(modalPop.style.display == "flex"){
					let inputEndLectureNumber = document.querySelector("#endNumber");
					let updateBtnClick = document.querySelector(".submitUpdate");
					closeDiv();
					updateBtnClick.addEventListener("click",e=>{
						let updatedLectureNumber = inputEndLectureNumber.value;
						let id = updateBtns[i].parentElement.parentElement.children[0].children[0].textContent;
						if(updatedLectureNumber.length !== 0){
							handleUpdate(id,updatedLectureNumber);
							document.querySelector(".update-modal").style.display = "none";
							document.getElementById("endNumber").value = "";
						}else{
							closeDiv();
						}
					});
				}
			});
		}
	}
}


// handling closing the modal Pop up
function closeDiv(){
	let closeBtn = document.querySelector(".close");
	closeBtn.addEventListener("click",e=>{
		document.getElementById("endNumber").value = "";
		e.target.parentElement.style.display = "none";
	});
}