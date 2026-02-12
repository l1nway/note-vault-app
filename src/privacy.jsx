import './privacy.css'
import {ShieldCheck, ClipboardList, Lock, FileText, Mail, Github} from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className='pp-page'>
      <div className='pp-header'>
        <h1>Privacy Policy</h1>
        <p className='pp-description'>
          Your privacy is important to us. This Privacy Policy explains what
          information we collect, how we use it, and how we protect your data.
        </p>
      </div>

      <div className='pp-grid'>
        <div className='pp-card'>
          <ClipboardList className='pp-icon success' />
          <h3>Information we collect</h3>
          <p>
            We collect information you provide such as your email address,
            profile data, notes, categories, and tags.
          </p>
        </div>

        <div className='pp-card'>
          <ShieldCheck className='pp-icon primary' />
          <h3>How we use your information</h3>
          <p>
            Your data is used to provide, maintain, and improve the service and
            communicate with you.
          </p>
        </div>

        <div className='pp-card'>
          <Lock className='pp-icon warning' />
          <h3>Data Security</h3>
          <p>
            We apply appropriate technical measures to protect your data from
            unauthorized access.
          </p>
        </div>

        <div className='pp-card'>
          <FileText className='pp-icon success' />
          <h3>Your Rights</h3>
          <p>
            You may access, update, or delete your personal information at any
            time.
          </p>
        </div>
      </div>

      <div className='pp-contact'>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <div className='pp-email'>
          <Mail size={16} />
          <span>adolf.l1nway@gmail.com</span>
        </div>
      </div>

    <footer className='app-footer'>
        <div className='app-footer-left'>
            <span className='app-footer-author'>Developed by l1nway</span>
        </div>
        <a href='https://github.com/l1nway'>
            <Github className='app-footer-github' />
        </a>
    </footer>
    </div>
  )
}
