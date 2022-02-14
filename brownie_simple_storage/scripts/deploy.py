from brownie import accounts, SimpleStorage, network, config


def deploy_simple_storage():
	print("N accounts", len(accounts))

	account = get_account()
	print("Account address ",account)

	# Load created from command line
	#account = accounts.load("dev-account")
	#print(account)

	# Deploy
	simple_storage = SimpleStorage.deploy({"from": account})
	print("Deploy", simple_storage)

	# Getter
	stored_value = simple_storage.retrieve()
	print("Getter", stored_value)

	# Setter
	transaction = simple_storage.store(15, {"from": account})
	transaction.wait(1)

	# Getter
	updated_stored_value = simple_storage.retrieve()
	print("Getter", updated_stored_value)



def get_account():
	if network.show_active() == "development":
		return accounts[0]
	else:
		return accounts.add(config["wallets"]["from_key"])


def main():
	deploy_simple_storage()

