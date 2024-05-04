import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Provider/AuthProviders";
import BookingTable from "./BookingTable";

const Bookings = () => {
    const { user } = useContext(AuthContext)
    const [bookings, setBookings] = useState([]);

    const handleDelete = (id) => {
        const procced = confirm(`are you sure Delete this?`)
        if (procced) {
            fetch(`http://localhost:5000/bookings/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if (data.deletedCount > 0) {
                        alert('delete succesfull')
                        const remaining = bookings.filter(booking => booking._id !== id)
                        setBookings(remaining)
                    }
                })
        }
    }
    const handleConfirm = (id) => {
        fetch(`http://localhost:5000/bookings/${id}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ status: 'confirm' })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.modifiedCount > 0) {
                    alert('Update succesfull')
                    const remaining = bookings.filter(booking => booking._id !== id)
                    const updating = bookings.find(booking => booking._id !== id)
                    updating.status = 'confirm'
                    const newBooking = [updating, ...remaining]
                    setBookings(newBooking)

                }
            })
        // const procced = confirm(`are you sure Delete this?`)
        // if (procced) {

        // }
    }

    const url = `http://localhost:5000/bookings/?email=${user?.email}`;
    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(data => setBookings(data))
    }, [url])

    return (
        <div>
            {
                bookings.length
            }
            <div className="overflow-x-auto">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>
                                <label>
                                    <input type="checkbox" className="checkbox" />
                                </label>
                            </th>
                            <th>Image</th>
                            <th>Service</th>
                            <th>Email</th>
                            <th>Price</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            bookings.map(booking => <BookingTable key={booking._id} booking={booking} handleDelete={handleDelete} handleConfirm={handleConfirm}></BookingTable>)
                        }
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default Bookings;