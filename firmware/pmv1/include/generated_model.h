#pragma once
#include <math.h>
// SYNTHETIC_ONLY. No validación de campo.
static constexpr const char* PMV1_MODEL_VERSION="pmv1-synthetic-tree-v1";
inline int pmv1_predict(const float x[5]) {
  if (x[2] <= 28.470335960388184) {
    if (x[3] <= 33.222251892089844) {
      if (x[1] <= 47.246332168579102) {
        if (x[4] <= 48.101734161376953) {
          if (x[2] <= 17.44183349609375) {
            if (x[0] <= 30.688135147094727) {
              return 0;
            } else {
              return 0;
            }
          } else {
            return 0;
          }
        } else {
          if (x[0] <= 33.925771713256836) {
            if (x[3] <= 17.451779365539551) {
              return 0;
            } else {
              return 1;
            }
          } else {
            return 1;
          }
        }
      } else {
        if (x[0] <= 39.31193733215332) {
          if (x[0] <= 35.715349197387695) {
            if (x[2] <= 22.361757278442383) {
              return 0;
            } else {
              return 0;
            }
          } else {
            if (x[4] <= 50.213554382324219) {
              return 0;
            } else {
              return 0;
            }
          }
        } else {
          if (x[4] <= 49.194269180297852) {
            return 0;
          } else {
            return 1;
          }
        }
      }
    } else {
      if (x[1] <= 64.575798034667969) {
        if (x[3] <= 76.207939147949219) {
          if (x[4] <= 21.544191360473633) {
            if (x[0] <= 35.034341812133789) {
              return 0;
            } else {
              return 1;
            }
          } else {
            if (x[0] <= 47.51317024230957) {
              return 1;
            } else {
              return 1;
            }
          }
        } else {
          return 1;
        }
      } else {
        if (x[4] <= 57.331966400146484) {
          return 0;
        } else {
          return 1;
        }
      }
    }
  } else {
    if (x[3] <= 54.291112899780273) {
      if (x[4] <= 191.45748901367188) {
        if (x[2] <= 77.348987579345703) {
          if (x[2] <= 33.810657501220703) {
            if (x[4] <= 39.541252136230469) {
              return 0;
            } else {
              return 1;
            }
          } else {
            if (x[0] <= 52.381185531616211) {
              return 1;
            } else {
              return 2;
            }
          }
        } else {
          if (x[1] <= 41.929105758666992) {
            if (x[0] <= 44.519968032836914) {
              return 2;
            } else {
              return 2;
            }
          } else {
            return 1;
          }
        }
      } else {
        if (x[0] <= 40.054620742797852) {
          if (x[4] <= 248.16212463378906) {
            if (x[4] <= 216.69742584228516) {
              return 1;
            } else {
              return 1;
            }
          } else {
            return 2;
          }
        } else {
          if (x[2] <= 62.16301155090332) {
            return 2;
          } else {
            return 2;
          }
        }
      }
    } else {
      if (x[2] <= 52.44999885559082) {
        if (x[4] <= 179.83332824707031) {
          if (x[0] <= 48.667087554931641) {
            if (x[1] <= 26.094680786132812) {
              return 1;
            } else {
              return 1;
            }
          } else {
            return 2;
          }
        } else {
          if (x[1] <= 46.145559310913086) {
            if (x[1] <= 35.287141799926758) {
              return 2;
            } else {
              return 2;
            }
          } else {
            return 1;
          }
        }
      } else {
        if (x[0] <= 35.289249420166016) {
          if (x[1] <= 49.433441162109375) {
            if (x[3] <= 65.025913238525391) {
              return 1;
            } else {
              return 2;
            }
          } else {
            return 1;
          }
        } else {
          if (x[1] <= 43.723520278930664) {
            if (x[2] <= 57.125743865966797) {
              return 2;
            } else {
              return 2;
            }
          } else {
            if (x[2] <= 60.688093185424805) {
              return 2;
            } else {
              return 2;
            }
          }
        }
      }
    }
  }
}
