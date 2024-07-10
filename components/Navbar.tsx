"use client"

import { faBolt, faBook, faChartSimple, faHouse, faInfo, faShare, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'


const Navbar = () => {

    const path = usePathname();

    return (
        <nav className='nav-bar  overflow-hidden max-w-[500px]'>

            <Link href={'/fren'} className={`w-[70px] h-[70px] overflow-hidden ${path === "/fren" ? "mt-[-20px]" : ''}`}>
                <Image src={'/buttons/ref.png'} width={300} height={300} alt='ref' />
            </Link>
            <Link href={'/boosts'} className={`w-[70px] h-[70px] overflow-hidden ${path === "/boosts" ? "mt-[-20px]" : ''}`}>
                <Image src={'/buttons/boost.png'} width={300} height={300} alt='boost' />
            </Link>
            <Link href={'/'} className={`w-[70px] h-[70px] overflow-hidden ${path === "/" ? "mt-[-20px]" : ''}`}>
                <Image src={'/buttons/tap.png'} width={300} height={300} alt='tap' />
            </Link>
            <Link href={'/task'} className={`w-[70px] h-[70px] overflow-hidden  ${path === "/task" ? "mt-[-20px]" : ''}`}>
                <Image src={'/buttons/task.png'} width={300} height={300} alt='task' />
            </Link>
            <Link href={'/stats'} className={`w-[70px] h-[70px] overflow-hidden ${path === "/stats" ? "mt-[-20px]" : ''}`}>
                <Image src={'/buttons/stat.png'} width={300} height={300} alt='stats' />
            </Link>

            {/* <Link href={'/fren'} className={` ${path === "/fren" ? "nav-link  active-link" : 'nav-link'}`}>
                <FontAwesomeIcon icon={faUsers} className={` ${path === "/fren" ? "icons  active-link" : 'icons'}`} />
                <p>Frens</p>
            </Link>

            <Link href={'/boosts'} className={` ${path === "/boosts" ? "nav-link  active-link" : 'nav-link'}`}>
                <FontAwesomeIcon icon={faBolt} className={` ${path === "/boosts" ? "icons  active-link" : 'icons'}`} />
                <p>Boosts</p>
            </Link>

            <Link href={'/'} className={` ${path === "/" ? "nav-link  active-link" : 'nav-link'}`}>
                <FontAwesomeIcon icon={faHouse} className={` ${path === "/" ? "icons active-link" : 'icons'}`} />
                <p>Home</p>
            </Link>

            <Link href={'/task'} className={` ${path === "/task" ? "nav-link  active-link" : 'nav-link'}`}>
                <FontAwesomeIcon icon={faBook} className={` ${path === "/task" ? "icons active-link" : 'icons'}`} />
                <p>Task</p>
            </Link>

            <Link href={'/stats'} className={` ${path === "/roadmap" ? "nav-link  active-link" : 'nav-link'}`}>
                <FontAwesomeIcon icon={faInfo} className={` ${path === "/roadmap" ? "icons active-link" : 'icons'}`} />
                <p>Stats</p>
            </Link> */}

        </nav>
    )
}

export default Navbar