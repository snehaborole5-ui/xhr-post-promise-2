const cl = console.log;
const cardcontainer = document.getElementById('cardcontainer')
const inputform = document.getElementById('inputform')
const title = document.getElementById('title')
const body = document.getElementById('body')
const userId = document.getElementById('userId')
const addpost = document.getElementById('addpost')
const updatepost = document.getElementById('updatepost')
const spinner = document.getElementById('spinner')

let url = `https://crud-b-21-default-rtdb.asia-southeast1.firebasedatabase.app/`
let base_url =`https://crud-b-21-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json`

let postArr =[]

function snackbar(msg,icon){
    swal.fire({
        title : msg,
        icon : icon,
        timer : 2000
    })
}

function makeApicall(method,url,body=null){
   return new Promise((resolve,reject) =>{
    let xhr = new XMLHttpRequest()
    xhr.open(method,url)
    xhr.send(body?JSON.stringify(body):null)
        xhr.onload = function (){
            if(xhr.status >= 200 && xhr.status <= 299){
                let res = JSON.parse(xhr.response)
                resolve(res)
            }else{
                let err = xhr.response
                reject(err)
            }
        }
   })
}

function fetchposts(){
    spinner.classList.remove('d-none')
    makeApicall('GET',base_url,null)
        .then((res) =>{
            cl(res)
            cardcontainer.innerHTML = ""; // जुना डेटा क्लिअर करण्यासाठी
            postArr = [];
            for (const key in res) {
                postArr.unshift({...res[key], id: key}) // इथून आयडी नीट पास केला
            }
            crateCards(postArr)
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })
        })
        .catch((err)=>{
            snackbar(err,'error')
        })
        .finally(()=>{
            spinner.classList.add('d-none')
        })
}

fetchposts()

function crateCards(arr){
    let result =``
    arr.forEach(ele=>{
        result+=` <div class="col-md-3 my-4" id="${ele.id}">
					<div class="card h-100">
						<div class="card-header" data-toggle="tooltip" data-placement="top" title="${ele.title}" >
							<h2>${ele.title}</h2>
						</div>
						<div class="card-body">
							<p>${ele.body}</p>
						</div>
						<div class="card-footer d-flex justify-content-between">
							<button class="btn btn-primary btn-sm" onclick="onEdit('${ele.id}')">Edit</button>
							<button class="btn btn-danger btn-sm" onclick="onRemove('${ele.id}')">Remove</button>
						</div>
					</div>
				</div>`
    })

    cardcontainer.innerHTML = result
}

function onsubmithandl(ele){
    spinner.classList.remove('d-none')
    ele.preventDefault()

    let newobj ={
        title: title.value,
        body : body.value,
        userId : userId.value
    }

    makeApicall('POST',base_url,newobj)
    .then((res)=>{
        newobj.id = res.name // Firebase ने दिलेला unique key
        CreateNewCard(newobj)
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    })
    .catch((err)=>{
        snackbar(err,'error')
    })
    .finally(()=>{
        spinner.classList.add('d-none')
    })
}

function CreateNewCard(obj){
    let div = document.createElement('div')
    div.className = `col-md-3 my-4`
    div.id = obj.id
    div.innerHTML =`<div class="card h-100">
						<div class="card-header" data-toggle="tooltip" data-placement="top" title="${obj.title}">
							<h2>${obj.title}</h2>
						</div>
						<div class="card-body">
							<p>${obj.body}</p>
						</div>
						<div class="card-footer d-flex justify-content-between">
							<button class="btn btn-primary btn-sm " onclick="onEdit('${obj.id}')">Edit</button>
							<button class="btn btn-danger btn-sm " onclick="onRemove('${obj.id}')">Remove</button>
						</div>
					</div>`
    
    cardcontainer.prepend(div)
    inputform.reset()
    snackbar(`The New Post with id ${obj.id} is Added Successfully!!`,'success')
    
    // इथून जुना पुट (PUT) कॉल काढून टाकला आहे कारण POST मुळे डेटा आधीच डेटाबेसमध्ये गेला आहे.
}

function onEdit(id){
    spinner.classList.remove('d-none')
    let editId = id
    localStorage.setItem('EditId',editId)

    let editUrl = `https://crud-b-21-default-rtdb.asia-southeast1.firebasedatabase.app/posts/${editId}.json`

    makeApicall('GET',editUrl,null)
        .then((res)=>{
            title.value = res.title
            userId.value = res.userId
            body.value = res.body

            addpost.classList.add('d-none')
            updatepost.classList.remove('d-none')
            inputform.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        })
        .catch((err)=>{
            snackbar(err,'error')
        })
        .finally(()=>{
            spinner.classList.add('d-none')
        })
}

function onupdatehandl(){
    spinner.classList.remove('d-none')

    let updateId = localStorage.getItem('EditId')
    let updateUrl = `${url}/posts/${updateId}.json`

    let updatePost ={
        title: title.value,
        body : body.value,
        userId : userId.value,
        id : updateId // इथे बदल केला: userId ऐवजी updateId वापरला
    }

    makeApicall('PUT',updateUrl,updatePost)
        .then((res)=>{
            let div = document.getElementById(updateId)
            let h2 = div.querySelector('.card-header h2')
            h2.innerHTML = res.title

            let p = div.querySelector('.card-body p')
            p.innerHTML = res.body

            addpost.classList.remove('d-none')
            updatepost.classList.add('d-none')

            inputform.reset()
            snackbar(`The Post with Id ${updateId} is Updated Successfully!!`,'success')
            
            div.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            div.classList.add('highlight');

            setTimeout(() => {
                div.classList.remove('highlight');
            }, 4000);
        })
        .catch((err)=>{
            snackbar(err,'error')
        })
        .finally(()=>{
            spinner.classList.add('d-none')
        })   
}

function onRemove(id){
    Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            spinner.classList.remove('d-none')

            let removeId = id
            let removeURl = `${url}/posts/${removeId}.json`

            makeApicall('DELETE',removeURl,null)
                .then((res)=>{
                    // इथे बदल केला: कंसे () लावून .remove() फंक्शन कॉल केले
                    document.getElementById(removeId).remove(); 
                    snackbar(`The Post with Id ${removeId} is Removed Successfully!!`,'success')
                })
                .catch((err)=>{
                    snackbar(err,'error')
                })
                .finally(()=>{
                    spinner.classList.add('d-none')
                })
        }
    });
}

inputform.addEventListener('submit',onsubmithandl)
updatepost.addEventListener('click',onupdatehandl)