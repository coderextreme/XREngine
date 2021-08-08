import React from 'react'
import styles from "./Gameoff.module.scss"
import walletclosed from "./WalletClosed.svg"
import Buttonn from "./Buttonn.svg"
import Microphonered from "./Microphonered.svg"
import Wing from "./Wing.svg"
const PermissionOff = () => {
    return (
        <div>
          <section className={styles.micoff}>
              <div className={styles.gameoff}>
                <span className={styles.wallet}><img src={walletclosed} alt="walletclosed"></img></span>
                <span className={styles.buttonn}><img src={Buttonn} alt="buttton"></img></span>
                <span className={styles.microphonered}><img src={Microphonered} alt="microphonered"></img></span>
                <span className={styles.wing}><img src={Wing} alt="wing"></img></span>
              </div>
          </section>
        </div>

    )
}

export default PermissionOff