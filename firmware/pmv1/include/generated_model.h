#pragma once
#include <math.h>
// SYNTHETIC_ONLY. No validación de campo.
static constexpr const char* PMV1_MODEL_VERSION="pmv1-synthetic-tree-v2";
inline int pmv1_predict(const float x[5]) {
  if (x[2] <= 27.818031311035156) {
    if (x[3] <= 35.698843002319336) {
      if (x[1] <= 41.664718627929688) {
        if (x[4] <= 45.744281768798828) {
          if (x[0] <= 32.053735733032227) {
            if (x[1] <= 25.406970024108887) {
              return 0;
            } else {
              if (x[3] <= 22.819982528686523) {
                return 0;
              } else {
                return 0;
              }
            }
          } else {
            if (x[0] <= 35.993585586547852) {
              return 0;
            } else {
              return 1;
            }
          }
        } else {
          if (x[0] <= 31.827890396118164) {
            if (x[1] <= 24.58867073059082) {
              return 1;
            } else {
              if (x[3] <= 16.964407920837402) {
                if (x[2] <= 12.953646183013916) {
                  return 0;
                } else {
                  return 0;
                }
              } else {
                if (x[4] <= 140.65071105957031) {
                  return 1;
                } else {
                  return 0;
                }
              }
            }
          } else {
            if (x[4] <= 103.64406585693359) {
              return 1;
            } else {
              if (x[1] <= 31.709339141845703) {
                if (x[0] <= 37.022018432617188) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                return 1;
              }
            }
          }
        }
      } else {
        if (x[0] <= 39.500539779663086) {
          if (x[4] <= 53.988990783691406) {
            if (x[2] <= 25.122300148010254) {
              if (x[1] <= 50.635322570800781) {
                if (x[0] <= 34.577943801879883) {
                  return 0;
                } else {
                  return 0;
                }
              } else {
                if (x[2] <= 17.319133758544922) {
                  return 0;
                } else {
                  return 0;
                }
              }
            } else {
              if (x[1] <= 51.340578079223633) {
                return 0;
              } else {
                if (x[3] <= 23.560096740722656) {
                  return 0;
                } else {
                  return 0;
                }
              }
            }
          } else {
            if (x[2] <= 22.199219703674316) {
              if (x[3] <= 27.813470840454102) {
                if (x[0] <= 36.220680236816406) {
                  return 0;
                } else {
                  return 0;
                }
              } else {
                if (x[1] <= 57.11247444152832) {
                  return 1;
                } else {
                  return 0;
                }
              }
            } else {
              if (x[3] <= 21.195088386535645) {
                if (x[0] <= 30.214167594909668) {
                  return 0;
                } else {
                  return 1;
                }
              } else {
                if (x[0] <= 21.94908332824707) {
                  return 0;
                } else {
                  return 1;
                }
              }
            }
          }
        } else {
          if (x[4] <= 45.31077766418457) {
            if (x[1] <= 55.831741333007812) {
              return 1;
            } else {
              if (x[3] <= 16.136326789855957) {
                if (x[2] <= 13.609479904174805) {
                  return 0;
                } else {
                  return 0;
                }
              } else {
                if (x[0] <= 40.96331787109375) {
                  return 0;
                } else {
                  return 0;
                }
              }
            }
          } else {
            if (x[2] <= 13.325960159301758) {
              return 0;
            } else {
              if (x[1] <= 65.334121704101562) {
                if (x[0] <= 43.252264022827148) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                return 1;
              }
            }
          }
        }
      }
    } else {
      if (x[3] <= 40.941761016845703) {
        if (x[4] <= 32.827299118041992) {
          if (x[1] <= 53.952199935913086) {
            return 1;
          } else {
            if (x[4] <= 4.0484592914581299) {
              return 0;
            } else {
              if (x[0] <= 26.731017112731934) {
                return 0;
              } else {
                return 0;
              }
            }
          }
        } else {
          if (x[1] <= 77.624889373779297) {
            if (x[0] <= 24.564929962158203) {
              return 1;
            } else {
              if (x[0] <= 31.92695140838623) {
                return 1;
              } else {
                return 1;
              }
            }
          } else {
            return 0;
          }
        }
      } else {
        if (x[4] <= 240.61727142333984) {
          if (x[3] <= 45.847381591796875) {
            if (x[4] <= 37.438596725463867) {
              if (x[0] <= 28.469527244567871) {
                return 0;
              } else {
                return 1;
              }
            } else {
              if (x[0] <= 23.403882026672363) {
                return 1;
              } else {
                if (x[2] <= 8.9361438751220703) {
                  return 1;
                } else {
                  return 1;
                }
              }
            }
          } else {
            if (x[0] <= 51.657257080078125) {
              if (x[1] <= 13.333791255950928) {
                return 1;
              } else {
                if (x[3] <= 47.655244827270508) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              return 1;
            }
          }
        } else {
          return 2;
        }
      }
    }
  } else {
    if (x[3] <= 58.733074188232422) {
      if (x[4] <= 217.42725372314453) {
        if (x[2] <= 71.384010314941406) {
          if (x[0] <= 52.077756881713867) {
            if (x[2] <= 32.994102478027344) {
              if (x[4] <= 42.38353157043457) {
                if (x[3] <= 26.193997383117676) {
                  return 0;
                } else {
                  return 1;
                }
              } else {
                if (x[1] <= 62.407831192016602) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              if (x[1] <= 17.659403800964355) {
                if (x[2] <= 63.586172103881836) {
                  return 1;
                } else {
                  return 2;
                }
              } else {
                if (x[4] <= 143.97113800048828) {
                  return 1;
                } else {
                  return 1;
                }
              }
            }
          } else {
            if (x[3] <= 39.623016357421875) {
              if (x[1] <= 32.992635726928711) {
                return 2;
              } else {
                if (x[4] <= 118.78662109375) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              if (x[4] <= 77.291965484619141) {
                return 1;
              } else {
                if (x[0] <= 56.86041259765625) {
                  return 2;
                } else {
                  return 2;
                }
              }
            }
          }
        } else {
          if (x[0] <= 38.329597473144531) {
            if (x[1] <= 34.089939117431641) {
              if (x[3] <= 44.473892211914062) {
                if (x[0] <= 28.879788398742676) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                if (x[2] <= 81.277149200439453) {
                  return 2;
                } else {
                  return 2;
                }
              }
            } else {
              if (x[4] <= 167.71996307373047) {
                if (x[3] <= 53.601169586181641) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                return 1;
              }
            }
          } else {
            if (x[3] <= 30.285092353820801) {
              if (x[1] <= 37.4847412109375) {
                return 2;
              } else {
                return 1;
              }
            } else {
              if (x[1] <= 58.74505615234375) {
                if (x[0] <= 45.410442352294922) {
                  return 2;
                } else {
                  return 2;
                }
              } else {
                return 1;
              }
            }
          }
        }
      } else {
        if (x[2] <= 55.224504470825195) {
          if (x[4] <= 272.06690979003906) {
            if (x[0] <= 44.366683959960938) {
              if (x[1] <= 37.44679069519043) {
                return 1;
              } else {
                if (x[1] <= 52.790197372436523) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              return 2;
            }
          } else {
            if (x[4] <= 308.6842041015625) {
              return 2;
            } else {
              return 2;
            }
          }
        } else {
          if (x[1] <= 50.599149703979492) {
            if (x[0] <= 32.504621505737305) {
              if (x[4] <= 258.94615173339844) {
                return 2;
              } else {
                if (x[0] <= 26.519043922424316) {
                  return 2;
                } else {
                  return 2;
                }
              }
            } else {
              if (x[3] <= 39.381464004516602) {
                if (x[0] <= 44.378976821899414) {
                  return 2;
                } else {
                  return 2;
                }
              } else {
                if (x[4] <= 227.50510406494141) {
                  return 2;
                } else {
                  return 2;
                }
              }
            }
          } else {
            if (x[4] <= 269.66716003417969) {
              return 1;
            } else {
              return 2;
            }
          }
        }
      }
    } else {
      if (x[2] <= 51.458120346069336) {
        if (x[4] <= 190.34806823730469) {
          if (x[0] <= 48.068859100341797) {
            if (x[1] <= 31.781429290771484) {
              if (x[3] <= 81.577831268310547) {
                if (x[0] <= 34.258035659790039) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                return 2;
              }
            } else {
              if (x[3] <= 90.211921691894531) {
                if (x[4] <= 125.17778015136719) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                return 1;
              }
            }
          } else {
            if (x[1] <= 45.73817253112793) {
              if (x[0] <= 51.922052383422852) {
                return 2;
              } else {
                if (x[2] <= 42.563205718994141) {
                  return 2;
                } else {
                  return 2;
                }
              }
            } else {
              return 1;
            }
          }
        } else {
          if (x[1] <= 37.70866584777832) {
            if (x[0] <= 40.087200164794922) {
              if (x[4] <= 252.41645050048828) {
                return 2;
              } else {
                return 2;
              }
            } else {
              return 2;
            }
          } else {
            if (x[4] <= 239.66432952880859) {
              if (x[3] <= 71.204563140869141) {
                return 1;
              } else {
                return 2;
              }
            } else {
              if (x[0] <= 44.618854522705078) {
                return 2;
              } else {
                return 2;
              }
            }
          }
        }
      } else {
        if (x[1] <= 60.421134948730469) {
          if (x[0] <= 31.4307861328125) {
            if (x[4] <= 162.6009521484375) {
              if (x[2] <= 63.682708740234375) {
                if (x[3] <= 75.010456085205078) {
                  return 1;
                } else {
                  return 2;
                }
              } else {
                if (x[3] <= 68.07904052734375) {
                  return 1;
                } else {
                  return 2;
                }
              }
            } else {
              if (x[3] <= 63.186061859130859) {
                return 2;
              } else {
                if (x[3] <= 70.365501403808594) {
                  return 2;
                } else {
                  return 2;
                }
              }
            }
          } else {
            if (x[4] <= 91.356769561767578) {
              if (x[2] <= 61.313339233398438) {
                if (x[1] <= 36.28544807434082) {
                  return 2;
                } else {
                  return 1;
                }
              } else {
                if (x[1] <= 49.581140518188477) {
                  return 2;
                } else {
                  return 2;
                }
              }
            } else {
              if (x[4] <= 179.65184020996094) {
                if (x[1] <= 45.460886001586914) {
                  return 2;
                } else {
                  return 2;
                }
              } else {
                if (x[3] <= 70.399326324462891) {
                  return 2;
                } else {
                  return 2;
                }
              }
            }
          }
        } else {
          if (x[0] <= 45.811122894287109) {
            if (x[2] <= 78.674114227294922) {
              if (x[4] <= 119.23073959350586) {
                if (x[4] <= 76.565090179443359) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                return 1;
              }
            } else {
              return 2;
            }
          } else {
            if (x[4] <= 156.60622406005859) {
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
