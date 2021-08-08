import React from 'react'
import styles from "./Gameon.module.scss"
import walletclosed from "./WalletClosed.svg"
import Buttonn from "./Buttonn.svg"
import Microphonegreen from "./Microphonegreen.svg"
import Wing from "./Wing.svg"

const PermissionOff = () => {
    return (
        <div>
          <section>
              <div className={styles.gameon}>
                <span className={styles.wallet}><img src={walletclosed} alt="walletclosed"></img></span>
                <span className={styles.buttonn}><img src={Buttonn} alt="buttton"></img></span>
                <span className={styles.microphonegreen}><img src={Microphonegreen} alt="microphonegreen"></img></span>
                <span className={styles.wing}><img src={Wing} alt="wing"></img></span>
              </div>
          </section>
        </div>

    )
}

export default PermissionOff