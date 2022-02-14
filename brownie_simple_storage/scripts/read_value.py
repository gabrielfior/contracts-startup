from brownie import SimpleStorage, accounts, config


def read_contract():
	simple_storage = SimpleStorage[-1]
	print("Accounts", len(SimpleStorage))
	print(simple_storage)
	print(simple_storage.retrieve())



def main():
	read_contract()
