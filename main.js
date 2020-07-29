import { of, iif, timer, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, combineLatest, scan, skip, repeatWhen, refCount, share, publishBehavior, map } from 'rxjs/operators';

const TICK_SPEED = 100;
const HOUR_TICK_LENGTH = 10;

const mainClock$ = timer(TICK_SPEED, TICK_SPEED).pipe(
  share()
);

const hour$ = mainClock$.pipe(
  scan(
    (acc, tick) => {
      if (acc > 23) {
        return 0;
      }

      return  (tick % HOUR_TICK_LENGTH === 0) ? acc + 1 : acc;
    }
  )
)

hour$.subscribe(
  (hour) => console.log(`Hour: ${hour}`)
)

const day$ = hour$.pipe(
  skip(HOUR_TICK_LENGTH),
  distinctUntilChanged(),
  scan(
    (acc, hour) => (hour === 0) ? acc + 1 : acc
  )
);

day$.subscribe(
  (day) => console.log(`Day: ${day}`)
)

const calender$ = day$.pipe(
  map(
    (day) =>
      iif(
        () => (day < 31),
        of({day: day % 30, month: 1, year: 1}),
        of({day: day % 30, month: Math.trunc(day / 30), year: (day / 120 > 1) ? Math.trunc(day / 120) : 1})
      )
  ),
  distinctUntilChanged()
)

calender$.subscribe(console.log)

const dateTime$ = calender$.pipe(
  combineLatest(hour$, (date, hour) => [date, hour])
);

// dateTime$.subscribe(
//   ([date, hour]) => console.log(`${hour}, ${date.day}/${date.month}/${date.year}`)
// )
