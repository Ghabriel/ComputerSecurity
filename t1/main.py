#!/bin/python3

from BlumBlumShub import BlumBlumShub
from time import time
from LCG import LCG
from MillerRabin import MillerRabin
from SolovayStrassen import SolovayStrassen

# Os tamanhos a serem considerados.
size_list = [40, 56, 80, 128, 168, 224, 256, 512, 1024, 2048, 4096]

# Gera uma semente para testar os geradores de números
# pseudo-aleatórios. O parâmetro size especifica o tamanho máximo
# em bits da semente gerada.
def seed_generator(size):
	t = str(int(time() * 100))
	seed = t
	for i in range(size - len(t)):
		seed += t
	return int(seed) % (2 ** size)

# Gera 10 números pseudo-aleatórios de cada tamanho para cada
# algoritmo.
def generate10():
	print("LCG:")
	for size in size_list:
		generator = LCG(size, seed_generator(2 * size))
		print("Ordem de grandeza: %s bits" % (size))
		for i in range(10):
			value = generator.generate()
			print(value)
			print("------------------------------")
		print("")

	print("####################################")

	print("BlumBlumShub:")
	for size in size_list:
		generator = BlumBlumShub(size, seed_generator(size))
		print("Ordem de grandeza: %s bits" % (size))
		for i in range(10):
			value = generator.generate()
			print(value)
			print("------------------------------")
		print("")

# Gera um número primo com o tamanho especificado (em bits)
def generate_prime(size, generator = None, accuracy = 10):
	if generator == None:
		# Inicializa o gerador de números aleatórios e gera um
		# valor inicial
		generator = LCG(size, seed_generator(2 * size))
	value = generator.generate()
	# Somente números que passam tanto em Miller-Rabin quanto em
	# Solovay-Strassen passam no teste.
	while not MillerRabin.test(value, accuracy) or not SolovayStrassen.test(value, accuracy):
		value = generator.generate()
		# Otimização: impede que números múltiplos de 2, 3 ou 5
		# sejam testados.
		while value % 2 == 0 or value % 3 == 0 or value % 5 == 0:
			value += 1
	return value

# Gera uma lista com 10 números primos para cada tamanho, exceto
# para 2048 bits, no qual são gerados 5, e para 4096 bits, no qual
# são gerados apenas 2. As limitações especiais podem ser
# removidas, elas apenas foram colocadas para acelerar o processo.
def generate_prime_list():
	for size in size_list:
		generator = LCG(size, seed_generator(2 * size))
		print("Ordem de grandeza: %s bits" % (size))
		limit = 10
		if size == 2048:
			limit = 5
		elif size == 4096:
			limit = 2
		for i in range(limit):
			print(generate_prime(size, generator))
			print("------------------------------")
		print("")

# Alguns exemplos de uso.
# generate10()
# print(generate_prime(1024))
# generate_prime_list();
