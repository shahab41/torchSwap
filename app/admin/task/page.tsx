import TaskForm from '@/components/TaskForm'
import { getTasks } from '@/libs/action'
import React from 'react'

const page = async () => {

    const tasks = await getTasks();
    console.log(tasks)
    return (
        <div className='flex flex-col w-full items-center justify-center'>
            <h1 className='text-white text-3xl mt-4 font-semibold'> Control Tasks</h1>
            <TaskForm tasks={JSON.stringify(tasks)} />

        </div>
    )
}

export default page