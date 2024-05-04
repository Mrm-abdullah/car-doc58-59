import { useContext } from "react";
import { useLoaderData } from "react-router-dom";
import { AuthContext } from "../../Provider/AuthProviders";

const Checkout = () => {
    const service = useLoaderData();
    const { title, _id , price, img} = service;
    const {user} = useContext(AuthContext);

    const handleBookService = (e) =>{
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const date = form.date.value;
        const price = form.price.value;
        const booking = {
            customername: name,
            email,
            date,
            price: price,
            img,
            service: title,
            service_id: _id
        }
        console.log(booking);

        fetch('http://localhost:5000/bookings', {
            method: 'POST',
            headers:{
                'content-type' : 'application/json'
            },
            body: JSON.stringify(booking)
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.insertedId){
                alert('success')
            }
        })

    }
    return (
        <div>
            <h2 className="text-center">Book Service: {title}</h2>
            <form onSubmit={handleBookService} className="card-body">
                <div className="grid grid-cols-2 gap-5">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Service Name</span>
                        </label>
                        <input type="text" placeholder="Service Name" defaultValue={user?.name} name="name" className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date</span>
                        </label>
                        <input type="date"className="input input-bordered" name="date" required />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input type="email" placeholder="Email" defaultValue={user?.email} name="email" className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Price</span>
                        </label>
                        <input type="text" placeholder="Price" className="input input-bordered" name="price" defaultValue={'$'+price} required />
                    </div>
                </div>
                <div className="form-control mt-6">
                    <button className="btn btn-primary btn-block">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default Checkout;