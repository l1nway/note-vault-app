import {faNoteSticky, faTags, faPalette, faBoxArchive, faUser, faArrowsRotate} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Github} from 'lucide-react'
import {Link} from 'react-router'
import {useMemo} from 'react'
import './landing.css'

export default function Landing() {

    const features = useMemo(() => [
        {
            title: 'Rich Notes',
            desc: 'Markdown support with image attachments.',
            icon: faNoteSticky
        }, {
            title: 'Categories & Tags',
            desc: 'Assign notes to categories and multiple tags.',
            icon: faTags
        }, {
            title: 'Custom Category Colors',
            desc: 'Choose unique colors for better organization.',
            icon: faPalette
        }, {
            title: 'Archive & Trash',
            desc: 'Archive notes or safely move them to trash.',
            icon: faBoxArchive
        }, {
            title: 'User Profiles',
            desc: 'Edit profile and upload custom avatar.',
            icon: faUser
        }, {
            title: 'Offline-First Sync',
            desc: 'Works without internet. Automatically synchronizes queued actions when back online.',
            icon: faArrowsRotate
    },], [])

    return (
        <div className='landing'>

        <section tabIndex={0} className='hero'>
            <h1>
                Note Vault
            <span className='gradient-text'> Offline-First Notes</span>
            </h1>
            <p className='landing-text'>Create, edit and manage notes completely offline. Your data syncs automatically when connection is restored.
            </p>
            <div className='hero-buttons'>
            <Link className='primary-btn' to='/register'>
                Register
            </Link>
            <Link className='secondary-btn' to='/notes'>
                Try demo
            </Link>
            </div>
        </section>

        {/* FEATURES */}
        <section className='features'>
            <h2>Main Features</h2>
            <div className='features-grid'>

            {features.map((feature, i) => (
                <div
                    key={i}
                    className='feature-card'
                >
                    <div className='landing-card-group'>
                        <FontAwesomeIcon icon={feature.icon} className='feature-icon'/>
                        <h3 style={{margin: 0}}>{feature.title}</h3>
                    </div>
                        <p>{feature.desc}</p>
                </div>
            ))}

            </div>
        </section>

        <footer className='app-footer' style={{marginTop: 'auto'}}>
            <div className='app-footer-left'>
                <span className='app-footer-author'>Developed by l1nway</span>
            </div>
            <a href='https://github.com/l1nway'>
                <Github className='app-footer-github'/>
            </a>
        </footer>
        </div>
  )
}