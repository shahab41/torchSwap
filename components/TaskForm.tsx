'use client';

import { createTasks, deleteTasks } from '@/libs/action';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

interface TaskFormProps {
    tasks: any; // Adjust this to the correct type if you have the type definition for tasks
}

const TaskForm: React.FC<TaskFormProps> = ({ tasks }) => {

    const [name, setName] = useState<string>("");
    const [link, setLink] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [loading, setloading] = useState<boolean>(false);

    const taskData = JSON.parse(tasks);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!name || !link || !price) {
                toast.error('Please fill all required fields!');
                return;
            }
            setloading(true);
            const formData = { name, link, price };
            const product = await createTasks(formData);
            if (product === true) {
                setloading(false);
                toast.success("Task launched successfully!");
            } else {
                toast.error("Error in launching task");
                setloading(false);
            }
        } catch (error) {
            setloading(false);
            toast.error("Error in launching task");
        }
    };

    const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setPrice(isNaN(value) ? 0 : value);
    };

    const handleDelete = async (id: string) => {
        try {
            const task = await deleteTasks(id) as boolean;
            if (task === true) {
                toast.success("Task Removed Successfully!");
                return;
            } else {
                toast.error('Error occured while deleting the task!')
                return;
            }
        } catch (error) {
            console.log(error);
            toast.error('Error occured while deleting the task!')
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className='w-[90%] mx-auto flex flex-col my-[20px] gap-[15px]'>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder='Enter the task title'
                    required
                    className='text-white border-[0.4px] py-3 text-sm px-3 rounded-lg outline-none border-white bg-transparent'
                />
                <input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    type="text"
                    placeholder='Enter the Redirect Link for Task'
                    required
                    className='text-white border-[0.4px] py-3 text-sm px-3 rounded-lg outline-none border-white bg-transparent'
                />
                <input
                    value={price}
                    onChange={handlePriceChange}
                    type="number"
                    placeholder='Enter the Winning prize amount'
                    required
                    className='text-white border-[0.4px] py-3 text-sm px-3 rounded-lg outline-none border-white bg-transparent'
                />
                <button disabled={loading || !name || !link || !price} type='submit' className='w-full font-bold bg-yellow-500 text-white py-3 px-3 rounded-md disabled:bg-gray-300 disabled:text-gray-400'>
                    Submit
                </button>
            </form>
            <div className='flex flex-col w-[90%] mx-auto'>
                {
                    taskData.map((e: any) => (
                        <div className='flex w-full border border-white my-2 py-4 px-5 rounded-lg blurry items-center justify-between'>
                            <div className='flex flex-col'>
                                <h1 className='text-white text-lg  font-semibold'>Title : <span className='text-yellow-400'>{e.name}</span></h1>
                                <p className='text-white text-sm my-1'> Prize : <span className='text-yellow-400 font-bold'>{e.tokens} Tokens</span> </p>
                                <p className='text-white text-sm '>Link : <span className='text-yellow-400 font-bold'>{e.redirectLink}</span></p>
                            </div>
                            <button onClick={() => handleDelete(e._id)} className='text-white p-3 rounded-md bg-red-500'>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    ))
                }
            </div>
        </>
    );
};

export default TaskForm;
