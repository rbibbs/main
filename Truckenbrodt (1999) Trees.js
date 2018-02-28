// Truckenbrodt (1999) JavaScript Syntax Trees

// Tohono O'odham

var allTrucktrees = [sTree_cowboybrandcalf]

/* wakial 'at  g   wisilo   cepos
   cowboy AUX DET  calf   branded */

var sTree_cowboybrandcalf = {
    "id": "IP",
    "cat": "cp",
    "children": [
        {
            "cat": "xp",
            "id": "DP",
            "children": [
                {
                    "cat": "xp",
                    "id": "NP",
                    "children": [
                        {
                            "id": "wakial",
                            "cat": "x0"
                        }
                    ]
                }
            ]
        },
        {
            "cat": "xbar",
            "id": "I'",
            "children": [
                {
                    "id": "'at",
                    "cat": "func"
                },
                {
                    "cat": "xp",
                    "id": "VP",
                    "children": [
                        {
                            "id": "t",
                            "cat": "func"
                        },
                        {
                            "cat": "xbar",
                            "id": "V'",
                            "children": [
                                {
                                    "cat": "xp",
                                    "id": "DP",
                                    "children": [
                                        {
                                            "id": "g",
                                            "cat": "func"
                                        },
                                        {
                                            "cat": "xp",
                                            "id": "NP",
                                            "children": [
                                                {
                                                    "id": "wisilo",
                                                    "cat": "x0"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "cepos",
                                    "cat": "x0"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}



/* na-t   g   wakial  t    cepos   g  wisilo
   Q-AUX DET cowboy TRACE branded DET calf */

var sTree_Qcowboybrandcalf = {
    "id": "IP",
    "cat": "cp",
    "children": [
        {
            "id": "na-t",
            "cat": "func"
        },
        {
            "cat": "xp",
            "id": "VP",
            "children": [
                {
                    "cat": "xp",
                    "id": "VP",
                    "children": [
                        {
                            "cat": "xp",
                            "id": "DP",
                            "children": [
                                {
                                    "id": "g",
                                    "cat": "func"
                                },
                                {
                                    "cat": "xp",
                                    "id": "NP",
                                    "children": [
                                        {
                                            "id": "wakial",
                                            "cat": "x0"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "cat": "xbar",
                            "id": "V'",
                            "children": [
                                {
                                    "id": "t",
                                    "cat": "func"
                                },
                                {
                                    "id": "cepos",
                                    "cat": "x0"
                                }
                            ]
                        }
                    ]
                },
                {
                    "cat": "xp",
                    "id": "DP",
                    "children": [
                        {
                            "id": "g_1",
                            "cat": "func"
                        },
                        {
                            "cat": "xp",
                            "id": "NP",
                            "children": [
                                {
                                    "id": "wisilo",
                                    "cat": "x0"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}









/* na-t   g    wakial    g    wisilo    cepos
   Q-AUX DET   cowboy   DET    calf   branded */

var sTree_Qcowboybrandcalfnoadjunction = {
    "id": "IP",
    "cat": "cp",
    "children": [
        {
            "id": "na-t",
            "cat": "func"
        },
        {
            "cat": "xp",
            "id": "VP",
            "children": [
                {
                    "cat": "xp",
                    "id": "DP",
                    "children": [
                        {
                            "id": "g",
                            "cat": "func"
                        },
                        {
                            "cat": "xp",
                            "id": "NP",
                            "children": [
                                {
                                    "id": "wakial",
                                    "cat": "x0"
                                }
                            ]
                        }
                    ]
                },
                {
                    "cat": "xbar",
                    "id": "V'",
                    "children": [
                        {
                            "cat": "xp",
                            "id": "DP",
                            "children": [
                                {
                                    "id": "g_1",
                                    "cat": "func"
                                },
                                {
                                    "cat": "xp",
                                    "id": "NP",
                                    "children": [
                                        {
                                            "id": "wisilo",
                                            "cat": "x0"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "id": "cepos",
                            "cat": "x0"
                        }
                    ]
                }
            ]
        }
    ]
}


/* g  Husi  kii
  DET Joe  house */

var sTree_Joehouse = {
    "id": "NP",
    "cat": "xp",
    "children": [
        {
            "cat": "xp",
            "id": "DP",
            "children": [
                {
                    "id": "g",
                    "cat": "func"
                },
                {
                    "cat": "xp",
                    "id": "NP",
                    "children": [
                        {
                            "id": "Husi",
                            "cat": "x0"
                        }
                    ]
                }
            ]
        },
        {
            "id": "kii",
            "cat": "x0"
        }
    ]
}




// Kimatuumbi


/* mpunga wa baandu
   rice   of people */

   var sTree_riceofpeople = {
    "id": "NP",
    "cat": "cp",
    "children": [
        {
            "id": "mpunga",
            "cat": "x0"
        },
        {
            "cat": "xp",
            "id": "PP",
            "children": [
                {
                    "id": "wa",
                    "cat": "x0"
                },
                {
                    "cat": "xp",
                    "id": "NP",
                    "children": [
                        {
                            "id": "baandu",
                            "cat": "x0"
                        }
                    ]
                }
            ]
        }
    ]
}



/* mpuunga waaboi
    rice   rotted */

var sTree_ricerotted = {
    "id": "IP",
    "cat": "cp",
    "children": [
        {
            "cat": "xp",
            "id": "NP",
            "children": [
                {
                    "id": "mpuunga",
                    "cat": "x0"
                }
            ]
        },
        {
            "cat": "xbar",
            "id": "I'",
            "children": [
                {
                    "id": "",
                    "cat": "func"
                },
                {
                    "cat": "xp",
                    "id": "VP",
                    "children": [
                        {
                            "id": "waaboi",
                            "cat": "x0"
                        }
                    ]
                }
            ]
        }
    ]
}




/*  naampei   kikoloomba  t   Mamboondo
   I-him-gave    shell  TRACE  Mamboondo */

var sTree_gaveshellMamboondo = {
    "id": "VP",
    "cat": "xp",
    "children": [
        {
            "id": "naampei",
            "cat": "x0"
        },
        {
            "cat": "xp",
            "id": "VP",
            "children": [
                {
                    "cat": "xp",
                    "id": "NP",
                    "children": [
                        {
                            "id": "kikoloombe",
                            "cat": "x0"
                        }
                    ]
                },
                {
                    "cat": "xp",
                    "id": "V'",
                    "children": [
                        {
                            "id": "t",
                            "cat": "func"
                        },
                        {
                            "cat": "xp",
                            "id": "NP",
                            "children": [
                                {
                                    "id": "Mamboondo",
                                    "cat": "x0"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}




/* kikolombe cha asikoopu kikulu
    shell    of    bishop  large */     //**** Uuncertain if the NP should go directly to lexical item, or if there should be N between

var sTree_largeshellofbishop = {
    "id": "NP",
    "cat": "xp",
    "children": [
        {
            "cat": "xp",
            "id": "NP",
            "children": [
                {
                    "id": "kikoloombe",
                    "cat": "x0"
                },
                {
                    "cat": "xp",
                    "id": "PP",
                    "children": [
                        {
                            "id": "cha",
                            "cat": "func"
                        },
                        {
                            "id": "asikoopu",
                            "cat": "x0"
                        }
                    ]
                }
            ]
        },
        {
            "cat": "xp",
            "id": "AP",
            "children": [
                {
                    "id": "kikulu",
                    "cat": "x0"
                }
            ]
        }
    ]
}







// SPACE RESERVED FOR ONE MORE TREE











// Chichewa


/* tinaba   kaluulu
   we-stole  hare */

var sTree_stolehare = {
    "id": "VP",
    "cat": "xp",
    "children": [
        {
            "id": "tinaba",
            "cat": "x0"
        },
        {
            "cat": "xp",
            "id": "NP",
            "children": [
                {
                    "id": "kaluulu",
                    "cat": "x0"
                }
            ]
        }
    ]
}



/* anamenya  nyumba  ndi   mwaala
    he-hit   house   with   rock */    // unclear how to do subscripts for "um" and "nd" (subscript "m" and "n" respectively)

var sTree_hithousewithrock = {
    "id": "VP",
    "cat": "xp",
    "children": [
        {
            "id": "anamenya",
            "cat": "x0"
        },
        {
            "cat": "xp",
            "id": "NP",
            "children": [
                {
                    "id": "nyumba",
                    "cat": "x0"
                }
            ]
        },
        {
            "cat": "xp",
            "id": "PP",
            "children": [
                {
                    "id": "ndi",
                    "cat": "func"
                },
                {
                    "cat": "xp",
                    "id": "NP",
                    "children": [
                        {
                            "id": "mwaala",
                            "cat": "x0"
                        }
                    ]
                }
            ]
        }
    ]
}



/* kagaalu kanaafa
    dog     died  */

var sTree_dogdied = {
    "id": "IP",
    "cat": "cp",
    "children": [
        {
            "cat": "xp",
            "id": "NP",
            "children": [
                {
                    "id": "kagaalu",
                    "cat": "x0"
                }
            ]
        },
        {
            "cat": "xbar",
            "id": "I'",
            "children": [
                {
                    "id": "",
                    "cat": "func"
                },
                {
                    "cat": "xp",
                    "id": "VP",
                    "children": [
                        {
                            "id": "kanaafa",
                            "cat": "x0"
                        }
                    ]
                }
            ]
        }
    ]
}


