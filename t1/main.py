#!/bin/python

from time import time
from LCG import LCG
from MillerRabin import MillerRabin

# Gera uma semente para testar os geradores de números pseudo-aleatórios.
# O parâmetro size especifica o tamanho máximo em bits da semente gerada.
def seed_generator(size):
	t = str(int(time() * 100))
	seed = t
	for i in range(size - len(t)):
		seed += t
	return int(seed) % (2 ** size)

# sizes = [40, 56, 80, 128, 168, 224, 256, 512, 1024, 2048, 4096]
# print("LCG:")
# for size in sizes:
# 	generator = LCG(size, seed_generator(size))
# 	print("Ordem de grandeza: %s bits" % (size))
# 	for i in range(10):
# 		value = generator.generate()
# 		bit_size = len(bin(value)) - 2
# 		print("%s (tamanho em bits: %s)" % (value, bit_size))
# 	print("")

# for value in range(100):
# value = (2 ** 3217) - 1
# print("Value: %s" % (value))
# print("Bit size: %s" % (len(bin(value)) - 2))
generator = LCG(4096, seed_generator(4096))
value = generator.generate()
if value % 2 == 0:
	value += 1
print("Primality: %s" % (MillerRabin.test(value)))
# print("%s primality: %s" % (value, MillerRabin.test(value)))
