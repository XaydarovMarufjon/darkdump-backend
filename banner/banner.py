import sys 
sys.dont_write_bytecode = True

class Banner(object):
    def LoadDarkdumpBanner(self):
        try:
            from termcolor import cprint, colored
            banner = '''                           __      __     _
 _ __ ___   __ _ _ __ _   _ ___  ___  __  _ __     \ \    / /   _| |
| '_ ` _ \ / _` | '__| | | |  _|'_  |/  \| `_ \     \ \  / /   |_  |
| | | | | | (_| | |  | |_| |  _| _| | [] | | | |     \ \/ /      | |
|_| |_| |_|\__,_|_|   \__,_|_|  \__/ \__/|_| |_|      \  /       | |      created by Marufjon Khaydarov
                                                       \/       |___|
              '''

            cprint(banner, 'magenta', attrs=['bold'])

        except ImportError as ie:
            print(banner)