import { Button, TextField, Typography } from '@material-ui/core';
import { SwapVert as SwapVertIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2, 0),
  },
  caption: {
    color: theme.palette.grey[500],
  },
  formControl: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoTextContainer: {
    marginTop: theme.spacing(3),
  },
  infoText: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const Swap: React.FC = () => {
  const classes = useStyles();

  return (
    <form
      className={classes.root}
      noValidate
      autoComplete="off"
      onSubmit={(ev) => ev.preventDefault()}
    >
      <div className={classes.formControl}>
        <Typography
          className={classes.caption}
          variant="caption"
          htmlFor="from-input"
          component="label"
        >
          From
        </Typography>
        <TextField
          variant="outlined"
          placeholder="0.0"
          inputProps={{ id: 'from-input', 'aria-label': 'swap from amount' }}
        />
      </div>

      <div>
        <SwapVertIcon />
      </div>

      <div className={classes.formControl}>
        <Typography
          className={classes.caption}
          variant="caption"
          htmlFor="to-input"
          component="label"
        >
          To (estimated)
        </Typography>
        <TextField
          variant="outlined"
          placeholder="0.0"
          inputProps={{ id: 'to-input', 'aria-label': 'swap from amount' }}
        />
      </div>

      <div className={classes.infoTextContainer}>
        <div className={classes.infoText}>
          <Typography className={classes.caption} variant="caption">
            Rate
          </Typography>
          <Typography className={classes.caption} variant="caption">
            1 XTZ = 1.01 CTEZ
          </Typography>
        </div>

        <div className={classes.infoText}>
          <Typography className={classes.caption} variant="caption">
            Price Impact
          </Typography>
          <Typography className={classes.caption} variant="caption">
            0.00000
          </Typography>
        </div>
      </div>

      <Button variant="contained" type="submit">
        Enter an amount
      </Button>
    </form>
  );
};

export { Swap };
