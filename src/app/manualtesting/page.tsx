import classNames from "classnames";
import styles from "@/app/page.module.css";
import { CardImage, RankList, SuitList } from "@/app/components/cards/card";

export default function Page() {
  return (
    <main className={styles.main}>
      <div className={classNames(styles.playingcards, styles.felt)}>
        {SuitList.map((suit) => (
          RankList.map((rank) => (
            <CardImage key={`${rank}-${suit}`} rank={rank} suit={suit} width={80} />
          ))
        ))}
        <CardImage rank="joker" suit="clubs" width={80} />
        <CardImage rank="joker" suit="diamonds" width={80} />
        <CardImage rank="joker" suit="hearts" width={80} />
        <CardImage rank="joker" suit="spades" width={80} />
        </div>
    </main>
  );
}
